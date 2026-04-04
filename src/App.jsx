import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from "recharts";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [role, setRole] = useState("viewer");
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("");

  const [form, setForm] = useState({
    date: "",
    category: "",
    amount: "",
    type: "expense",
  });

  // Load data
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("transactions"));
    if (data) {
      setTransactions(data);
    } else {
      const defaultData = [
        { id: 1, date: "2026-04-01", amount: 20000, category: "Salary", type: "income" },
        { id: 2, date: "2026-04-02", amount: 500, category: "Food", type: "expense" },
        { id: 3, date: "2026-04-03", amount: 800, category: "Shopping", type: "expense" },
        { id: 4, date: "2026-04-04", amount: 300, category: "Travel", type: "expense" },
      ];
      setTransactions(defaultData);
      localStorage.setItem("transactions", JSON.stringify(defaultData));
    }
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  // calculations
  const income = transactions
    .filter(t => t.type === "income")
    .reduce((a, b) => a + b.amount, 0);

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce((a, b) => a + b.amount, 0);

  const balance = income - expense;

  // filter
  const filteredTransactions = transactions.filter(t =>
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  // sorting
  let sortedTransactions = [...filteredTransactions];
  if (sortType === "high") sortedTransactions.sort((a, b) => b.amount - a.amount);
  if (sortType === "low") sortedTransactions.sort((a, b) => a.amount - b.amount);

  // highest spending
  const highestSpending = transactions
    .filter(t => t.type === "expense")
    .sort((a, b) => b.amount - a.amount)[0];

  // add transaction
  const addTransaction = () => {
    if (!form.date || !form.category || !form.amount) return;

    const newTransaction = {
      id: Date.now(),
      date: form.date,
      category: form.category,
      amount: Number(form.amount),
      type: form.type,
    };

    setTransactions([...transactions, newTransaction]);

    setForm({ date: "", category: "", amount: "", type: "expense" });
  };

  // PIE CHART DATA
  const categoryMap = {};

  transactions
    .filter(t => t.type === "expense")
    .forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

  const categoryData = Object.keys(categoryMap).map(key => ({
    name: key,
    value: categoryMap[key],
  }));

  // trend data
  const trendData = transactions.map((t, index) => ({
    date: t.date,
    balance: transactions.slice(0, index + 1).reduce((acc, curr) => {
      return curr.type === "income"
        ? acc + curr.amount
        : acc - curr.amount;
    }, 0),
  }));

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">Finance Dashboard</h1>

        {/* Role */}
        <select
          className="mb-4 p-2 border rounded"
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="viewer">Viewer</option>
          <option value="admin">Admin</option>
        </select>

        {/* Admin Form */}
        {role === "admin" && (
          <div className="bg-white p-4 rounded-xl shadow mb-6 hover:shadow-lg transition">
            <h2 className="font-semibold mb-3">Add Transaction</h2>

            <div className="flex flex-wrap gap-2">
              <input type="date" className="border p-2 rounded"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })} />

              <input type="text" placeholder="Category" className="border p-2 rounded"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })} />

              <input type="number" placeholder="Amount" className="border p-2 rounded"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })} />

              <select className="border p-2 rounded"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>

              <button
                onClick={addTransaction}
                className="bg-blue-500 text-white px-4 py-2 rounded">
                Add
              </button>
            </div>
          </div>
        )}

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
            <h2>Total Balance</h2>
            <p className="text-2xl font-bold">₹{balance}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
            <h2>Income</h2>
            <p className="text-green-600 text-2xl">₹{income}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
            <h2>Expenses</h2>
            <p className="text-red-600 text-2xl">₹{expense}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">

          {/* ✅ FIXED PIE CHART ONLY */}
          <div className="bg-white p-4 rounded-xl shadow flex justify-center">
            {categoryData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No expense data available
              </div>
            ) : (
              <PieChart width={400} height={300}>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            )}
          </div>

          {/* Line Chart */}
          <div className="bg-white p-4 rounded-xl shadow">
            <LineChart width={500} height={300} data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="balance" stroke="#8884d8" />
            </LineChart>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="mb-3 font-semibold">Transactions</h2>

          <input
            type="text"
            placeholder="Search..."
            className="border p-2 mb-2 w-full rounded"
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border p-2 mb-3 rounded"
            onChange={(e) => setSortType(e.target.value)}
          >
            <option value="">Sort</option>
            <option value="high">High to Low</option>
            <option value="low">Low to High</option>
          </select>

          <table className="w-full border text-left">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2">Category</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Type</th>
              </tr>
            </thead>

            <tbody>
              {sortedTransactions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center p-4">
                    No transactions found
                  </td>
                </tr>
              ) : (
                sortedTransactions.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="p-2">{t.date}</td>
                    <td className="p-2">{t.category}</td>
                    <td className="p-2">₹{t.amount}</td>
                    <td className={`p-2 ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                      {t.type}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Insights */}
        <div className="mt-6 bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Insights</h2>
          <p>
            Highest Spending: {highestSpending ? `${highestSpending.category} ₹${highestSpending.amount}` : "N/A"}
          </p>
          <p>Total Transactions: {transactions.length}</p>
        </div>

      </div>
    </div>
  );
}

export default App;