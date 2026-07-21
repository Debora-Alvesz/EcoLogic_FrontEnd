import { useState, useEffect } from "react";

export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados que guardam os dados já calculados e formatados para a tela
  const [financialWaste, setFinancialWaste] = useState({ valor: "R$ 0,00", porcentagem: "0%", tendencia: "down" });
  const [anomalies, setAnomalies] = useState({ total: 0, recomendacao: "Analisando..." });
  const [sectors, setSectors] = useState([]);
  const [administradores, setAdministradores] = useState([]);
  const [topSectors, setTopSectors] = useState([]);
  const [topAdmins, setTopAdmins] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    async function buscarECruzarDadosDiretor() {
      try {
        setLoading(true);
        const BASE_URL = "http://localhost:8080";
        
        // 1. BUSCA DE DADOS: O front-end faz as requisições para os 4 endpoints do Spring Boot ao mesmo tempo
        const [resSetores, resProdutos, resConsumos, resAdmins] = await Promise.all([
          fetch(`${BASE_URL}/api/v1/setores`),
          fetch(`${BASE_URL}/produtos`),
          fetch(`${BASE_URL}/consumos`),
          fetch(`${BASE_URL}/api/v1/usuarios/tipo/administradores`)
        ]);

        if (!resSetores.ok || !resProdutos.ok || !resConsumos.ok || !resAdmins.ok) {
          throw new Error("Erro ao conectar com o banco de dados.");
        }

        // Transforma as respostas do Java em listas utilizáveis no JavaScript
        const listaSetores = await resSetores.json();
        const listaProdutos = await resProdutos.json();
        const listaConsumos = await resConsumos.json();
        const listaAdmins = await resAdmins.json();

        setAdministradores(listaAdmins);

        // =========================================================================
        // 2. CÁLCULO DE GASTOS GERAIS E DESPERDÍCIOS
        // =========================================================================
        let gastoTotalEscola = 0;
        let totalDesperdicio = 0;

        listaConsumos.forEach((consumo) => {
          // Relaciona o consumo com a tabela de produtos para descobrir o custo unitário do item
          const produtoRef = listaProdutos.find(p => p.nome === consumo.nomeProduto);
          
          if (produtoRef) {
            // Valor do lote = quantidade retirada multiplicado pelo preço do produto
            const custoItem = consumo.quantidade * (produtoRef.custoUnitario || 0);
            gastoTotalEscola += custoItem; // Acumula no valor total de consumo da escola
            
            // REGRA DE NEGÓCIO: Se a retirada for maior que 25 unidades, classifica como "Gasto Crítico"
            if (consumo.quantidade > 25) {
              totalDesperdicio += custoItem;
            }
          }
        });

        // Formata os valores calculados para a moeda Real (R$)
        setFinancialWaste({
          valor: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(gastoTotalEscola),
          porcentagem: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalDesperdicio),
          tendencia: totalDesperdicio > 500 ? "up" : "down"
        });

        // =========================================================================
        // 3. SEPARAÇÃO DE GASTOS POR SETOR
        // =========================================================================
        const mapaGastosSetor = {};

        // Cria uma lista inicial contendo todos os setores da escola zerados
        listaSetores.forEach(s => mapaGastosSetor[s.nome] = { nome: s.nome, totalGasto: 0 });

        // Percorre as saídas e soma o valor financeiro dentro de cada setor correspondente
        listaConsumos.forEach((consumo) => {
          const nomeDoSetor = consumo.nomeSetor;
          const produtoRef = listaProdutos.find(p => p.nome === consumo.nomeProduto);
          
          if (nomeDoSetor && produtoRef && mapaGastosSetor[nomeDoSetor]) {
            mapaGastosSetor[nomeDoSetor].totalGasto += consumo.quantidade * (produtoRef.custoUnitario || 0);
          }
        });

        // Ordena os setores para colocar o que gerou mais despesa no topo da lista (Ranking)
        const rankingSetores = Object.values(mapaGastosSetor)
          .sort((a, b) => b.totalGasto - a.totalGasto)
          .map(s => ({
            nome: s.nome,
            gasto: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(s.totalGasto),
            bruto: s.totalGasto
          }));

        setTopSectors(rankingSetores);

        // =========================================================================
        // 4. AUDITORIA: LANÇAMENTOS POR ADMINISTRADOR (BLINDADO)
        // =========================================================================
        const mapaGastosAdm = {};

        // Cria uma lista de controle inicial mapeando os administradores pelo nome
        listaAdmins.forEach(adm => {
          mapaGastosAdm[adm.nome] = { 
            nome: adm.nome, 
            cargo: adm.cargo || "Administrador", 
            totalGasto: 0, 
            totalRegistros: 0 
          };
        });

        // Percorre os consumos e vincula ao administrador correto
        listaConsumos.forEach((consumo) => {
          const produtoRef = listaProdutos.find(p => p.nome === consumo.nomeProduto);
          
          if (produtoRef) {
            const custoItem = consumo.quantidade * (produtoRef.custoUnitario || 0);
            
            // 1. Tenta pegar o nome do usuário direto do banco de dados Java
            let nomeDoAdm = consumo.usuarioNome || consumo.nomeUsuario || consumo.usuario?.nome;
            
            // 2. REGRA DE SALVAÇÃO: Se o Java não enviou o usuário, vinculamos pelo setor do cargo!
            if (!nomeDoAdm) {
              if (consumo.nomeSetor === "Limpeza") {
                nomeDoAdm = "Rodrigo Adm"; // Limpeza vai para o Rodrigo
              } else if (consumo.nomeSetor === "Cantina") {
                nomeDoAdm = "Maria Cantina"; // Cantina vai para a Maria
              }
            }
            
            // Se encontrou o administrador (seja pelo nome ou pelo setor), computa os dados
            if (nomeDoAdm && mapaGastosAdm[nomeDoAdm]) {
              mapaGastosAdm[nomeDoAdm].totalGasto += custoItem;
              mapaGastosAdm[nomeDoAdm].totalRegistros += 1; // Soma o lançamento
            }
          }
        });

        // Organiza o ranking dos administradores por volume de dinheiro
        const rankingAdmins = Object.values(mapaGastosAdm)
          .sort((a, b) => b.totalGasto - a.totalGasto)
          .map(a => ({
            nome: a.nome,
            cargo: a.cargo,
            registros: a.totalRegistros, // Envia a quantidade de registros para a tela
            gasto: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(a.totalGasto)
          }));

        setTopAdmins(rankingAdmins);

        // =========================================================================
        // 5. CÁLCULO DE PROPORÇÃO DA BARRA VISUAL DO SETOR
        // =========================================================================
        const coresFixo = ["#0066cc", "#7c3aed", "#008080", "#ea580c", "#d92d20"];
        const maiorGasto = rankingSetores[0]?.bruto || 1; // Pega o setor que mais gastou como teto (100%)

        // Define dinamicamente o preenchimento da barra de 0% a 100% de forma proporcional
        const setoresTratados = rankingSetores.map((setor, index) => ({
          nome: setor.nome,
          valor: Math.min(Math.round((setor.bruto / maiorGasto) * 100), 100),
          cor: coresFixo[index % coresFixo.length]
        }));
        setSectors(setoresTratados);

        // =========================================================================
        // 6. PRODUTOS COM ESTOQUE BAIXO (menos de 3 unidades)
        // =========================================================================
        const produtosEstoqueBaixo = listaProdutos
          .filter((p) => {
            const qtd = p.estoque ?? p.quantidadeEstoque ?? p.qtdEstoque ?? p.quantidade ?? 0;
            return qtd < 3;
          })
          .map((p) => ({
            nome: p.nome,
            estoque: p.estoque ?? p.quantidadeEstoque ?? p.qtdEstoque ?? p.quantidade ?? 0,
            unidade: p.unidade || "un"
          }))
          .sort((a, b) => a.estoque - b.estoque); // menor estoque primeiro (mais crítico no topo)

        setLowStockProducts(produtosEstoqueBaixo);

        setAnomalies({
          total: listaConsumos.filter(c => c.quantidade > 25).length,
          recomendacao: rankingSetores[0] ? `Atenção concentrada em: Setor ${rankingSetores[0].nome}` : "Dados normais"
        });

        setError(null);
      } catch (err) {
        console.error("Erro no processamento:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    buscarECruzarDadosDiretor();
  }, []);

  return { loading, error, financialWaste, anomalies, sectors, administradores, topSectors, topAdmins, lowStockProducts };
}