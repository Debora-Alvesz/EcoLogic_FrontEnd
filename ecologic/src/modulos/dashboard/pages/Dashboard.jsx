function Dashboard({ onNavigate }) {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dashboard EcoLogic</h1>
      <p style={styles.subtitle}>Bem-vindo ao painel de controle</p>
      
      <div style={styles.buttonContainer}>
        <button 
          style={styles.button}
          onClick={() => onNavigate('login')}
        >
          Ir para Login
        </button>
        <button 
          style={styles.button}
          onClick={() => onNavigate('criar-perfil')}
        >
          Ir para Criar Perfil
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5',
    gap: '20px'
  },
  title: {
    fontSize: '32px',
    color: '#333',
    margin: 0
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    margin: 0
  },
  buttonContainer: {
    display: 'flex',
    gap: '20px',
    marginTop: '30px'
  },
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#4CAF50',
    color: 'white',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease'
  }
}

export default Dashboard
