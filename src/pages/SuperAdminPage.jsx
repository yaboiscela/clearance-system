import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import AdminPage from "./AdminPage"

import { FaUserCog } from "react-icons/fa";
import { RiLogoutBoxRFill } from "react-icons/ri";
import { PiStudentFill } from "react-icons/pi";

const API = import.meta.env.VITE_API_URL;


export default function SuperAdminPage({ student, setStudent, handleSearch, studNo, setStudNo, setShowUsers, showUsers }){

    return(
        <div className='w-full h-full fixed flex flex-col gap-[10px] print:bg-transparent'>
            {showUsers ? <AddUsers showUsers={showUsers} setShowUsers={setShowUsers}/> : <AdminPage student={student} setShowUsers={setShowUsers} setStudent={setStudent} handleSearch={handleSearch} studNo={studNo} setStudNo={setStudNo}/>}
        </div>
    )
}

function AddUsers({ showUsers, setShowUsers }) {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [users, setUsers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState("");
    const [form, setForm] = useState({
        name: "", username: "", password: "", department: "", user_type: "admin"
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(users.filter(u =>
            u.name.toLowerCase().includes(q) ||
            u.username.toLowerCase().includes(q) ||
            u.department.toLowerCase().includes(q)
        ));
    }, [search, users]);

    async function fetchUsers() {
        try {
            const res = await fetch(`${API}/api/users`);
            const data = await res.json();
            setUsers(data);
            setFiltered(data);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        }
    }

    async function saveUser() {
        if (!form.name || !form.username || !form.department) {
            alert("Please fill in all required fields.");
            return;
        }

        try {
            if (selected) {
                // UPDATE
                const res = await fetch(`${API}/api/users/${selected.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                });
                if (!res.ok) {
                    const err = await res.json();
                    alert(err.message);
                    return;
                }
            } else {
                // CREATE
                if (!form.password) { alert("Password is required for new users."); return; }
                const res = await fetch(`${API}/api/users`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                });
                if (!res.ok) {
                    const err = await res.json();
                    alert(err.message);
                    return;
                }
            }
            await fetchUsers();
            clearForm();
        } catch (err) {
            console.error("Save failed:", err);
        }
    }

    async function deleteUser(id) {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            await fetch(`${API}/api/users/${id}`, { method: "DELETE" });
            await fetchUsers();
            if (selected?.id === id) clearForm();
        } catch (err) {
            console.error("Delete failed:", err);
        }
    }

    function selectUser(user) {
        setSelected(user);
        setForm({
            name: user.name,
            username: user.username,
            password: "",
            department: user.department,
            user_type: user.user_type || "admin",
        });
    }

    function clearForm() {
        setSelected(null);
        setForm({ name: "", username: "", password: "", department: "", user_type: "admin" });
    }

    function getInitials(name) {
        return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
    }

    const handleAdminClick = () => {
        navigate("/");
        sessionStorage.removeItem("isAdmin");
        sessionStorage.removeItem("isSuperAdmin");
        sessionStorage.removeItem("adminUser");
    };

    return (
        <div className="w-full h-full fixed px-13 py-5 flex flex-col gap-[10px] bg-black/50 print:bg-transparent">
            <div className="w-full h-full grid grid-cols-[0.75fr_1fr] gap-10">

                {/* ── LEFT: Add / Edit Form ── */}
                <div className="h-full flex flex-col bg-[#F4F4F4] rounded-xl p-8 gap-4 print:hidden overflow-y-auto">
                    <h1 className="text-3xl font-semibold">
                        {selected ? "Edit user" : "Add user"}
                    </h1>

                    <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
                        Name
                        <input
                            className="border text-base p-2 px-3 font-normal rounded-lg bg-white"
                            type="text"
                            placeholder="Full name"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                        />
                    </label>

                    <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
                        Username
                        <input
                            className="border text-base p-2 px-3 font-normal rounded-lg bg-white"
                            type="text"
                            placeholder="e.g. jdelacruz"
                            value={form.username}
                            onChange={e => setForm({ ...form, username: e.target.value })}
                        />
                    </label>

                    <label className="flex flex-col gap-1 text-sm font-medium text-gray-600 relative">
                        Password
                        <input
                            className="border text-base p-2 px-3 pr-16 font-normal rounded-lg bg-white"
                            type={showPassword ? "text" : "password"}
                            placeholder={selected ? "Leave blank to keep current" : "Password"}
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                        />
                        <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 bottom-2 text-sm text-gray-500 hover:text-gray-800"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </label>

                    <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
                        Department
                        <select
                            className="border text-base p-2 font-normal rounded-lg bg-white"
                            value={form.department}
                            onChange={e => setForm({ ...form, department: e.target.value })}
                        >
                            <option value="">Select department</option>
                            <option>Registrar</option>
                            <option>Library</option>
                            <option>Cashier</option>
                            <option>HRM Lab</option>
                            <option>Com Lab</option>
                            <option>Guidance</option>
                            <option>ProWare</option>
                            <option>OSA</option>
                            <option>E2E</option>
                        </select>
                    </label>

                    <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
                        Role
                        <select
                            className="border text-base p-2 font-normal rounded-lg bg-white"
                            value={form.user_type}
                            onChange={e => setForm({ ...form, user_type: e.target.value })}
                        >
                            <option value="admin">Admin</option>
                            <option value="superadmin">Super Admin</option>
                        </select>
                    </label>

                    <button
                        onClick={saveUser}
                        className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 font-medium text-base mt-1"
                    >
                        {selected ? "Update user" : "Save user"}
                    </button>

                    {selected && (
                        <button
                            onClick={clearForm}
                            className="bg-gray-200 text-gray-700 p-2.5 rounded-lg hover:bg-gray-300 font-medium text-base"
                        >
                            Cancel / Add new
                        </button>
                    )}

                    <div className="mt-2 bg-blue-50 border-l-4 border-blue-400 rounded p-3 text-sm text-gray-600">
                        Super admin users can manage other accounts. Assign this role carefully.
                    </div>
                </div>

                {/* ── RIGHT: User List ── */}
                <div className="h-full flex flex-col bg-[#F4F4F4] rounded-xl p-8 gap-4 print:hidden overflow-hidden">
                    <h1 className="text-3xl font-semibold">User list</h1>

                    <input
                        className="border text-base p-2 px-3 rounded-lg bg-white"
                        type="text"
                        placeholder="Search by name, username, or department..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />

                    <div className="flex flex-col gap-2 overflow-y-auto flex-1">
                        {filtered.length === 0 && (
                            <p className="text-center text-gray-400 mt-10 text-sm">No users found.</p>
                        )}
                        {filtered.map(user => (
                            <div
                                key={user.id}
                                onClick={() => selectUser(user)}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                                    ${selected?.id === user.id
                                        ? "border-blue-400 bg-blue-50"
                                        : "border-gray-200 bg-white hover:bg-gray-50"}`}
                            >
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                    {getInitials(user.name)}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-800 truncate">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.username} · {user.department}</p>
                                </div>

                                {/* Badge */}
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0
                                    ${user.user_type === "superadmin"
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-blue-100 text-blue-700"}`}>
                                    {user.user_type === "superadmin" ? "Super admin" : "Admin"}
                                </span>

                                {/* Delete button */}
                                <button
                                    onClick={e => { e.stopPropagation(); deleteUser(user.id); }}
                                    className="text-gray-400 hover:text-red-500 text-lg px-1 flex-shrink-0"
                                    title="Delete user"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Bottom Nav ── */}
            <div className="text-black grid grid-cols-[0.75fr_1fr] gap-10 items-center print:hidden">
                <div className="flex w-full justify-between">
                    <button
                        onClick={handleAdminClick}
                        className="bg-white cursor-pointer w-fit rounded text-4xl p-2 opacity-50 transition-all hover:bg-red-500 hover:text-white hover:opacity-100"
                    >
                        <RiLogoutBoxRFill />
                    </button>
                    {sessionStorage.getItem("isSuperAdmin") && (
                        <button
                            onClick={() => setShowUsers(false)}
                            className="bg-white cursor-pointer w-fit flex rounded text-4xl p-2 opacity-50 transition-all hover:bg-yellow-500 hover:text-white hover:opacity-100"
                        >
                            <PiStudentFill />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}