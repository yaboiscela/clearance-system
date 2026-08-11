import React, { useState, useEffect } from "react";

export default function ClearanceStatus({status, setStatus, title, alt, cashier, department, hidden}) {

    const [temporaryStatus, setTemporaryStatus] = useState(status || "Pending");

    console.log(department);

    const handleChange = (e) => {
        setTemporaryStatus(e.target.value);
        setStatus(e.target.value);
        console.log(e.target.value);
    }

    useEffect(() => {
        setTemporaryStatus(status || "Pending");
    }, [status]);

    return (
        <div className="grid grid-rows-[0.5fr_1fr]">
            <div className="bg-[#9FA8B8] flex items-center justify-center">
                <h1 hidden={hidden} className="font-semibold text-lg print:text-sm text-white">{title}</h1>
            </div>
            {
                sessionStorage.getItem("isAdmin") === "true" || sessionStorage.getItem("isSuperAdmin") === "true" && location.pathname === "/admin" ?
                <div>
                    <select disabled={status === null || department ? true : false} onChange={handleChange} className={`print:hidden w-35 cursor-pointer disabled:cursor-not-allowed font-medium disabled:opacity-50 transition-opacity border ${hidden || 'my-2'} rounded px-[5px] py-[2px]  ${temporaryStatus == "Submitted" || temporaryStatus == "Cleared" || temporaryStatus == "Paid"  ? "text-green-600 focus:ring-3 focus:border-transparent focus:ring-green-300 focus:outline-0" : temporaryStatus == "N/A" ? "text-gray-600 focus:ring-3 focus:border-transparent focus:ring-gray-300 focus:outline-0" : "text-red-600 focus:ring-3 focus:border-transparent focus:ring-red-300 focus:outline-0"}`} value={temporaryStatus}>
                        {alt ? 
                            (cashier ? <option className="text-green-600" value="Submitted">Paid</option> : <option className="text-green-600" value="Submitted">Cleared</option>)
                        :
                        <option className="text-green-600" value="Submitted">Submitted</option>
                        }
                        <option className="text-gray-600" value="N/A">N/A</option>
                        {cashier ? <option className="text-red-600" value="Pending">With Bal.</option> : <option className="text-red-600" value="Pending">Pending</option>}
                    </select>
                    <h2 className={`print:block hidden font-medium ${status == "Submitted" || status == "Cleared" || status == "Paid" ? "text-green-600" : status == "N/A" ? "text-gray-600" : "text-red-600"}`}>{cashier && status === "Pending" ? "With Bal." : cashier && status === "Submitted" ? "Paid" : !department && status === "Submitted" ? "Cleared" : status || "--"}</h2>
                </div>
                :
                <h2 className={`font-medium ${status ? "underline" : "no-underline"} p-[10px] ${status == "Submitted" || status == "Cleared" || status == "Paid" ? "text-green-600" : status == "N/A" ? "text-gray-600" : "text-red-600"}`}>{cashier && status === "Pending" ? "With Bal." : cashier && status === "Submitted" ? "Paid" : !department && status === "Submitted" ? "Cleared" : status || "--"}</h2>
            }
        </div>
    )
}