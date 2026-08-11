import { useState } from "react"
import { useNavigate } from "react-router-dom";

import { RiAdminFill } from "react-icons/ri";
import { FaPrint } from "react-icons/fa6";
import { IoMdArrowRoundBack } from "react-icons/io";


import Table from "../components/Table"

export default function LandingPage({student, setStudent, handleSearch, studNo, setStudNo, handleClear}) {

    const [credentials, setCredentials] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const BASE_URL = import.meta.env.VITE_API_URL;

    const handleLogin = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: credentials.username, password: credentials.password }),
            });

            const result = await res.json();

            if (res.status === 401) {
                setError(result.message);
                return;
            }
            sessionStorage.setItem("adminName", result.name);
            sessionStorage.setItem("adminDepartment", result.department);
            sessionStorage.setItem("isAdmin", result.type === "admin" ? "true" : "false");
            sessionStorage.setItem("isSuperAdmin", result.type === "superadmin" ? "true" : "false");
            navigate(result.type === "admin" || result.type === "superadmin" ? "/admin" : "/clearance");

        } catch (err) {
            console.error("Login error:", err);
            setError("Login failed. Please try again.");
        }
    };


    const handleChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, ''); // strip non-digits
    setStudNo(val);
    };

    const handlePrint = () => {
        window.print();
    }
    const handleAdminClick = () => {
        if (sessionStorage.getItem("isAdmin") === "true" || sessionStorage.getItem("isSuperAdmin") === "true") {
            navigate("/admin");
        } else {
            setIsLoginOpened(false); // open modal
        }
    }
    const [isLoginOpened, setIsLoginOpened] = useState(true);
    
    return (
        <div className='w-full h-full fixed px-13 py-5 flex flex-col gap-[10px] bg-black/50 print:bg-transparent'>
            <div className='w-full h-full grid grid-cols-[0.75fr_1fr] gap-10'>
                <div className="text-white flex flex-col pt-50 gap-4 print:hidden">
                    <div className='flex flex-col'>
                        <h1 className='text-[84px]/17 font-semibold'>STI Caloocan</h1>
                        <h2 className='text-[32px]/17 font-light'>Graduation Clearance</h2>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[24px] pb-1" htmlFor="studNo"> Student #:</label>
                        <input className="text-[20px] border-2 border-[#0057B8] text-black bg-white rounded px-2" type="text" onChange={handleChange} value={studNo} maxLength={11} pattern="[0-9]+" name="studNo" id="studNo" />
                    </div>
                    <div className="flex items-center justify-between my-4">
                        <button onClick={handleSearch} className="bg-blue-500 hover:bg-blue-800 transition-colors w-35 text-2xl font-semibold text-white py-[10px] cursor-pointer rounded">
                            Search
                        </button>
                        <button disabled={student.studNo === null} onClick={handleClear} className="disabled:opacity-50 disabled:cursor-not-allowed disabledtext-green-700 disabledbg-green-300 cursor-pointer print:hidden w-35 py-[10px] text-2xl align-middle font-medium text-red-700 hover:text-white transition-colors bg-red-300 hover:bg-red-600 rounded-md">
                            Clear
                        </button>
                    </div>
                    <div className="bg-white text-black text-lg p-5 mt-10 rounded-2xl">
                        <h1 className="text-2xl font-semibold">Status</h1>
                        <div className="justify-between flex mt-2">
                            <div>
                                <h1 className="font-semibold text-green-600">Completed / Cleared: </h1>
                                <h1>Requirements are COMPLETED</h1>
                            </div>
                            <div>
                                <h1 className="font-semibold text-red-600">Pending: </h1>
                                <h1>NOT Cleared</h1>
                            </div>
                            <div>
                                <h1 className="font-semibold text-gray-600">N/A: </h1>
                                <h1>NOT APPLICABLE</h1>
                            </div>
                        </div>
                    </div>
                </div>
                <Table student={student}/>
            </div>
            {/* Buttons */}
            <div className="text-black flex items-center justify-between print:hidden">
                <button onClick={handleAdminClick} className="bg-white cursor-pointer rounded text-4xl p-2 opacity-50 transition-opacity hover:opacity-100"><RiAdminFill/></button>
                <button onClick={handlePrint} className="bg-[#1A1A2E] cursor-pointer rounded border-2 text-white border-white flex text-2xl font-semibold py-2 px-4 items-center gap-2 opacity-50 transition-opacity hover:opacity-100"><FaPrint className="text-2xl"/>Print</button>
            </div>
            {isLoginOpened || 
                <div className="w-full h-full absolute items-center justify-center left-0 top-0 flex bg-black/50">
                    <div className="bg-slate-100 text-2xl h-fit min-w-150 px-10 py-10 flex flex-col rounded-lg shadow-lg/60 relative">
                        <h1 className="font-semibold mb-1">Username</h1>
                        <input onChange={(e) => setCredentials({...credentials, username: e.target.value})} className="border rounded mb-4 px-2 py-1" type="text" name="username" id="username" />
                        <h1 className="font-semibold mb-1">Password</h1>
                        <input onChange={(e) => setCredentials({...credentials, password: e.target.value})} onKeyDown={e => e.key === "Enter" && handleLogin()} className="border rounded px-2 py-1" type="password" name="password" id="password" />
                        {error && <p className="text-red-500 mt-2">{error}</p>}
                        <button onClick={handleLogin} className="bg-blue-500 hover:bg-blue-800 text-white transition-colors w-35 text-2xl font-semibold border-white border-2 py-[10px] mt-5 cursor-pointer rounded">
                            Login
                        </button>
                        <button className="absolute cursor-pointer top-2 right-2 text-gray-400 hover:text-black transition-colors text-4xl flex justify-center items-center rounded w-10 h-10" onClick={() => { setIsLoginOpened(true); setError(""); }}>
                            <IoMdArrowRoundBack />
                        </button>
                    </div>
                </div>
            }
        </div>
    )
}