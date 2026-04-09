import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [role, setRole] = useState("viewer");
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("");
  const [dark, setDark] = useState(false);

  const [form, setForm] = useState({
    date: "",
    category: "",
    amount: "",
    type: "expense",
  });

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("transactions"));
    if (data && data.length > 0) {
      setTransactions(data);
    } else {
      const defaultData = [
        { id: 1, date: "2026-04-01", amount: 20000, category: "Salary", type: "income" },
        { id: 2, date: "2026-04-02", amount: 500, category: "Food", type: "expense" },
        { id: 3, date: "2026-04-03", amount: 800, category: "Shopping", type: "expense" },
        { id: 4, date: "2026-04-04", amount: 300, category: "Travel", type: "expense" },
        { id: 5, date: "2026-04-05", amount: 1500, category: "Freelance", type: "income" },
      ];
      setTransactions(defaultData);
      localStorage.setItem("transactions", JSON.stringify(defaultData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const income = transactions.filter(t => t.type === "income").reduce((a, b) => a + b.amount, 0);
  const expense = transactions.filter(t => t.type === "expense").reduce((a, b) => a + b.amount, 0);
  const balance = income - expense;

  const filteredTransactions = transactions.filter(t =>
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  let sortedTransactions = [...filteredTransactions];
  if (sortType === "high") sortedTransactions.sort((a, b) => b.amount - a.amount);
  if (sortType === "low") sortedTransactions.sort((a, b) => a.amount - b.amount);

  const highestSpending = transactions
    .filter(t => t.type === "expense")
    .sort((a, b) => b.amount - a.amount)[0];

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

  const categoryMap = {};
  transactions.filter(t => t.type === "expense").forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });

  const categoryData = Object.keys(categoryMap).map(key => ({
    name: key,
    value: categoryMap[key],
  }));

  const trendData = transactions.map((t, index) => ({
    date: t.date,
    balance: transactions.slice(0, index + 1).reduce((acc, curr) => {
      return curr.type === "income" ? acc + curr.amount : acc - curr.amount;
    }, 0),
  }));

  const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];

  return (
    <div className={dark ? "min-h-screen bg-black text-white p-6" : "min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6"}>
      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Finance Dashboard</h1>

          <button
            onClick={() => setDark(!dark)}
            className="bg-gray-800 text-white px-3 py-1 rounded"
          >
            Toggle Dark
          </button>
        </div>

        <select
          className="mb-4 p-2 border rounded"
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="viewer">Viewer</option>
          <option value="admin">Admin</option>
        </select>

        {role === "admin" && (
          <div className="bg-white text-black p-4 rounded-2xl shadow mb-6">
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                Add
              </button>
            </div>
          </div>
        )}

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-5 rounded-2xl shadow">
            <h2 className="text-gray-500">Balance</h2>
            <p className="text-3xl font-bold text-blue-600">₹{balance}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow">
            <h2 className="text-gray-500">Income</h2>
            <p className="text-green-600 text-3xl font-bold">₹{income}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow">
            <h2 className="text-gray-500">Expense</h2>
            <p className="text-red-500 text-3xl font-bold">₹{expense}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">

          <div className="bg-white p-4 rounded-2xl shadow flex justify-center">
            <PieChart width={400} height={300}>
              <Pie data={categoryData} dataKey="value" outerRadius={100}>
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={4} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="mb-3 font-semibold">Transactions</h2>

          <input
            type="text"
            placeholder="Search..."
            className="border p-2 mb-2 w-full rounded-lg"
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

          <table className="w-full border rounded-lg overflow-hidden">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2">Category</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Type</th>
              </tr>
            </thead>

            <tbody>
              {sortedTransactions.map((t) => (
                <tr key={t.id} className="border-t hover:bg-gray-100">
                  <td className="p-2">{t.date}</td>
                  <td className="p-2">{t.category}</td>
                  <td className="p-2">₹{t.amount}</td>
                  <td className={`p-2 ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {t.type}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Insights */}
        <div className="mt-6 bg-white p-4 rounded-2xl shadow">
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