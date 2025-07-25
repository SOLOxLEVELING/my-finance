import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    // The background color for the entire app area
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* A simple placeholder for the navigation bar */}
          <h1 className="text-2xl font-bold text-blue-700">FinanceDash</h1>
        </nav>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* We are now rendering the main dashboard page */}
        <DashboardPage />
      </main>
    </div>
  );
}

export default App;