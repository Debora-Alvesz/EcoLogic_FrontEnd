function Dashboard({ onNavigate }) {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dashboard EcoLogic</h1>
      <p style={styles.subtitle}>Bem-vindo ao painel de controle</p>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 72px)',
    backgroundColor: '#eef2f6',
    gap: '20px',
    padding: '40px 20px',
    boxSizing: 'border-box'
  },
  title: {
    fontSize: '32px',
    color: '#002b55',
    margin: 0,
    fontFamily: 'Inter, sans-serif',
    fontWeight: 800
  },
  subtitle: {
    fontSize: '16px',
    color: '#59677d',
    margin: 0,
    fontFamily: 'Inter, sans-serif'
  }
}

export default Dashboard
