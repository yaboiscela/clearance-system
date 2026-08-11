import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import XLSX from "xlsx-js-style";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Table from "../components/Table";
import Result from "../components/Result";

import { RiLogoutBoxRFill } from "react-icons/ri";
import { FaPrint } from "react-icons/fa6";
import { TbDatabaseImport } from "react-icons/tb";
import { FaFileExcel } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaBoxesStacked } from "react-icons/fa6";
import { RxUpdate } from "react-icons/rx";
import { FaUserCog } from "react-icons/fa";

export default function AdminPage({student, setStudent, handleSearch, studNo, setStudNo, setShowUsers, showUsers, handleClear}) {

    const navigate = useNavigate();
    
    const BASE_URL = import.meta.env.VITE_API_URL;
    
    const [status, setStatus] = useState("");
    const [showImport, setShowImport] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [showBulk, setShowBulk] = useState(false);
    const [completionDate, setCompletionDate] = useState(Date.now());
    const [isImporting, setIsImporting] = useState(false);
    const [results, setResults] = useState([]);

    const [temporaryStatus, setTemporaryStatus] = useState(status || "Pending");

    const setDepartment = (key) => (val) => {
        setStudent(prev => ({
            ...prev,
            departments: { ...prev.departments, [key]: val }
        }));
    };

    const formatPostgreDate = (dateStr) => {
        return new Date(dateStr).toISOString().split("T")[0];
    };
    
    function mapStudent(row) {
        return {
            studNo:       row.stud_no,
            surname:      row.last_name,
            firstName:    row.first_name,
            middleName:   row.middle_name,
            email:        row.email,
            phone:        row.phone,
            course:       row.course,
            credentials: {
                tor:       row.tor,
                goodMoral: row.good_moral,
                f137:      row.f137,
                f138:      row.f138,
                honorDism: row.honor_dism,
                birthCert: row.birth_cert,
                xRay:      row.x_ray,
                hepa:      row.hepa,
            },
            departments: {
                library:  row.library,
                cashier:  row.cashier,
                hrmLab:   row.hrm_lab,
                comLab:   row.com_lab,
                guidance: row.guidance,
                proware:  row.proware,
                osa:      row.osa,
                e2e:      row.e2e,
            },
            subjects:       row.subjects,
            remarks:        row.remarks,
            completionDate: row.completion_date,
            updatedBy:      row.updated_by,
        };
    }
        
    const handleOnClickSearch = async (studNo) => {
        console.log("Initiating search for student number:", studNo);
        try {
            const res = await fetch(`${BASE_URL}/api/students/${studNo}`);
            if (res.status === 404) {
                setNotFound(false);
                setStudent({
                    studNo: null, surname: null, firstName: null,
                    middleName: null, email: null, phone: null, course: null,
                    credentials: { tor: null, goodMoral: null, f137: null, f138: null,
                        honorDism: null, birthCert: null, xRay: null, hepa: null },
                    departments: { library: null, cashier: null, hrmLab: null,
                        comLab: null, guidance: null, proware: null, osa: null, e2e: null },
                    subjects: null, remarks: null, completionDate: null, updatedBy: null
                });
                return;
            }

            setStudNo(studNo);
            const row = await res.json();
            setStudent(mapStudent(row));

        } catch (err) {
            console.error("Search failed:", err);
        }
    };

    const formatDateAtTime = (dateStr) => {
        return new Date(dateStr).toLocaleString("en-PH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const handleLiveSearch = async (query) => {
        if (!query) return setResults([])
        
        const res = await fetch(`${BASE_URL}/api/students/search/${query}`)
        const data = await res.json()
        setResults(data)
        console.log(data);
    }

    useEffect(() => {
        handleLiveSearch(studNo);
    }, [studNo]);

    const handleBulkUpdate = async () => {
        try {
            // Read Excel file
            const buffer = await selectedBulkFile.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet);

            console.log(rows);

            // Extract student IDs — adjust column name to match your Excel header
            const studNos = rows
                .map(row => String(row['STUDENT ID'] || row['Student ID'] || row['stud_no'] || '').trim())
                .filter(id => id !== '');

            if (studNos.length === 0) {
                alert('No student IDs found in the file.');
                return;
            }

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/students/bulk-update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    studNos, 
                    department: deptFilter, 
                    status: temporaryStatus,
                    updatedBy: sessionStorage.getItem("adminName") + " / " + formatDateAtTime(Date.now())
                })
            });

            const data = await res.json();
            alert(data.message);
            setShowBulk(false)
        } catch (err) {
            console.error('Bulk update failed:', err);
            alert('Bulk update failed.');
        }
    };

    const handleDeptChange = (e) => {
        setTemporaryStatus(e.target.value);
        console.log(e.target.value);
    }
    const handleChange = (e) => {
        const val = e.target.value
        setStudNo(val);
        handleLiveSearch(val);
    };
    const handlePrint = () => {
        window.print();
    }
    const handleAdminClick = () => {
        navigate("/");
        sessionStorage.removeItem("isAdmin");
        sessionStorage.removeItem("isSuperAdmin");
        sessionStorage.removeItem("adminUser");
    }
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedBulkFile, setSelectedBulkFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file.name); // just show the filename for now
    };
    const handleFileBulkUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedBulkFile(file); // just show the filename for now
    };

    const handleAddStudent = async () => {
        if (!addStudent.studNo || !addStudent.firstName || !addStudent.surname || !addStudent.middleName || !addStudent.course) {
            alert("Please fill in all required fields.");
            return;
        }

        setIsImporting(true);
        setStatus("Adding student...");

        try {
            const res = await fetch(`${BASE_URL}/api/import`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rows: [{
                        "STUDENT ID":   addStudent.studNo.toUpperCase(),
                        "FIRST NAME":   addStudent.firstName.toUpperCase(),
                        "LAST NAME":    addStudent.surname.toUpperCase(),
                        "MIDDLE NAME":  addStudent.middleName.toUpperCase(),
                        "PROGRAM":      addStudent.course.toUpperCase(),
                    }],
                    meta: {
                        updatedBy:      sessionStorage.getItem("adminName") || "Admin",
                        completionDate: completionDate
                            ? completionDate.toISOString().split("T")[0]
                            : null,
                    }
                }),
            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.message);

            setStatus(result.message);
            alert(`Student ${addStudent.firstName} ${addStudent.surname} added successfully.`);

            // Reset form
            setAddStudent({ studNo: "", firstName: "", surname: "", middleName: "", course: "" });
            setCompletionDate(null);
            setShowImport(false);

        } catch (err) {
            console.error("Add student failed:", err);
            setStatus("Failed: " + err.message);
            alert("Failed to add student: " + err.message);
        } finally {
            setIsImporting(false);
        }
    };
    
    const handleImportConfirm = async () => {
        if (selectedFile) {
            const file = fileInputRef.current?.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (event) => {
                const workbook = XLSX.read(event.target.result, { type: "binary" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(sheet);

                console.log(data); // check the parsed data structure
                setIsImporting(true);
                const res = await fetch(`${BASE_URL}/api/import`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        rows: data,
                        meta: { updatedBy: sessionStorage.getItem("adminName") + " / " + formatDateAtTime(Date.now()), completionDate: formatPostgreDate(completionDate) }
                    }),
                });
                console.log(res);
                const result = await res.json();
                setIsImporting(false);
                setStatus(result.message);
            };
            reader.readAsBinaryString(file);
        } else {
        await handleAddStudent();
    }
    };
    
    const [exportYear, setExportYear] = useState("");
    const [deptFilter, setDeptFilter] = useState(sessionStorage.getItem("adminDepartment") || "");

    const handleExport = async () => {
        try {
            const url = exportYear
                ? `${BASE_URL}/api/export?year=${exportYear}`
                : `${BASE_URL}/api/export`;

            const res = await fetch(url);
            const data = await res.json();

            if (!data.length) {
                alert("No records found for the selected year.");
                return;
            }

            const formatted = data.map(row => ({
                "STUDENT ID":      row.stud_no,
                "LAST NAME":       row.last_name,
                "FIRST NAME":      row.first_name,
                "MIDDLE NAME":     row.middle_name,
                "EMAIL":           row.email,
                "PHONE":           row.phone,
                "COURSE":          row.course,
                "TOR":             row.tor,
                "GOOD MORAL":      row.good_moral,
                "F137":            row.f137,
                "F138":            row.f138,
                "HONOR DISM":      row.honor_dism,
                "BIRTH CERT":      row.birth_cert,
                "X-RAY":           row.x_ray,
                "HEPA":            row.hepa,
                "LIBRARY":         row.library,
                "CASHIER":         row.cashier,
                "HRM LAB":         row.hrm_lab,
                "COM LAB":         row.com_lab,
                "GUIDANCE":        row.guidance,
                "PROWARE":         row.proware,
                "OSA":             row.osa,
                "E2E":             row.e2e,
                "SUBJECTS":        row.subjects,
                "REMARKS":         row.remarks,
                "COMPLETION DATE": row.completion_date
                    ? new Date(row.completion_date).toLocaleDateString("en-PH", {
                        year: "numeric", month: "long", day: "numeric"
                    })
                    : null,
                "UPDATED BY":      row.updated_by,
            }));

            const ws = XLSX.utils.json_to_sheet(formatted);
            const headers = Object.keys(formatted[0]);

            // Auto fit column widths
            ws["!cols"] = headers.map(header => {
                const maxLen = Math.max(
                    header.length,
                    ...formatted.map(row => (row[header] ? String(row[header]).length : 0))
                );
                return { wch: maxLen + 4 };
            });

            // Header styling — gray bg, white text, bold, bigger font
            headers.forEach((header, i) => {
                const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
                if (!ws[cellRef]) return;
                ws[cellRef].s = {
                    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 13 },
                    fill: { fgColor: { rgb: "4A5568" } },
                    alignment: { horizontal: "center" },
                };
            });

            ws["!freeze"] = "F2"

            // Status color mapping
            const statusColors = {
                "Pending":   { font: "9C0006", fill: "FFC7CE" },
                "Cleared":   { font: "276221", fill: "C6EFCE" },
                "Submitted": { font: "276221", fill: "C6EFCE" },
                "N/A":       { font: "595959", fill: "D9D9D9" },
            };

            const statusColumns = [
                "TOR", "GOOD MORAL", "F137", "F138", "HONOR DISM", "BIRTH CERT", "X-RAY", "HEPA",
                "LIBRARY", "CASHIER", "HRM LAB", "COM LAB", "GUIDANCE", "PROWARE", "OSA", "E2E"
            ];

            // Data row styling
            formatted.forEach((row, rowIdx) => {
                headers.forEach((header, colIdx) => {
                    if (!statusColumns.includes(header)) return;
                    const cellRef = XLSX.utils.encode_cell({ r: rowIdx + 1, c: colIdx });
                    if (!ws[cellRef]) return;
                    const colors = statusColors[row[header]];
                    if (!colors) return;
                    ws[cellRef].s = {
                        font: { color: { rgb: colors.font } },
                        fill: { fgColor: { rgb: colors.fill } },
                        alignment: { horizontal: "center" },
                    };
                });
            });

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Students");
            XLSX.writeFile(wb, `clearance_${exportYear || "all"}_${new Date().toISOString().split("T")[0]}.xlsx`, {
                bookType: "xlsx",
                cellStyles: true,
            });

        } catch (err) {
            console.error("Export failed:", err);
        }
    };

    const [notFound, setNotFound] = useState(true);
    const [addStudent, setAddStudent] = useState({
        studNo: '', firstName: '', surname: '', middleName: '', course: ''
    });

    return(
        <div className='w-full h-full fixed px-13 py-5 flex flex-col gap-[10px] bg-black/50 print:bg-transparent'>
            <div className='w-full h-full grid grid-cols-[0.75fr_1fr] gap-10'>
                <div className="h-full flex flex-col bg-[#F4F4F4] rounded-xl p-10 gap-2 print:hidden">
                    <div className='flex flex-col'>
                        <h1 className='text-center text-[60px]/12 font-bold'>Graduation Clearance</h1>
                        <h2 className='text-center text-[30px]/12 font-medium'>Admin</h2>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[24px] pb-1" htmlFor="studNo"> Student # / Name:</label>
                        <input onKeyDown={e => e.key === "Enter" && handleSearch()} onChange={handleChange} className="text-[20px] border-2 border-[#0057B8] text-black bg-white rounded px-2" type="text" value={studNo} maxLength={11} pattern="[0-9]+" name="studNo" id="studNo" />
                    </div>
                    <div className="flex items-center justify-between my-4">
                        <button onClick={handleSearch} className="bg-blue-500 hover:bg-blue-800 transition-colors w-35 text-2xl font-semibold text-white py-[10px] cursor-pointer rounded">
                            Search
                        </button>
                        <button disabled={student.studNo === null} onClick={handleClear} className="disabled:opacity-50 disabled:cursor-not-allowed disabledtext-green-700 disabledbg-green-300 cursor-pointer print:hidden w-35 py-[10px] text-2xl align-middle font-medium text-red-700 hover:text-white transition-colors bg-red-300 hover:bg-red-600 rounded-md">
                            Clear
                        </button>
                    </div>
                    <div className="w-full h-full rounded-lg overflow-clip border-3 overflow-y-auto max-h-115 relative">
                        <div className="sticky top-0">
                            <h1 className="text-center bg-[#4A5568] text-white border-black/50 text-3xl border-b-3 font-semibold p-4">Search Results</h1>
                        </div>
                        {results.length === 0 ? (
                            <p className="text-center text-gray-400 p-4">No results found.</p>
                        ) : (
                            results.map((result) => (
                                <div className="w-full h-fit border-b-2 hover:bg-blue-300 transition-colors border-[#4A5568] last:border-0 even:bg-gray-200 odd:bg-gray-300 cursor-pointer" onClick={() => handleOnClickSearch(result.stud_no)}>
                                    <Result key={result.stud_no} result={result} />
                                </div>
                            ))
                        )}
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold">Status</h1>
                        <div className="justify-between flex">
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
                <Table student={student} setStudent={setStudent}/>
            </div>

            {/* Action Buttons */}
            <div className="text-black grid grid-cols-[0.75fr_1fr] gap-10  items-center justify-between print:hidden">
                <div className="flex w-full justify-between">
                    <button onClick={handleAdminClick} className="bg-white cursor-pointer w-fit rounded text-4xl p-2 opacity-50 transition-all hover:bg-red-500 hover:text-white hover:opacity-100"><RiLogoutBoxRFill /></button>
                    <button hidden={sessionStorage.getItem("isSuperAdmin") !== "true"} onClick={() => setShowUsers(true)} className="bg-white cursor-pointer w-fit flex rounded text-4xl p-2 opacity-50 transition-all hover:bg-yellow-500 hover:text-white hover:opacity-100"><FaUserCog className="translate-x-0.5" /></button>
                </div>
                <div className="flex w-full justify-between">
                    <button 
                        onClick={() => setShowImport(true)} 
                        className="text-green-700 hover:text-white transition-colors bg-green-300 hover:bg-green-600 cursor-pointer rounded border-2 flex text-2xl font-semibold py-2 px-4 items-center gap-2">
                            <TbDatabaseImport className="text-2xl"/>
                            Add Student
                    </button>
                    <button
                        onClick={() => setShowBulk(true)} 
                        className="disabled:opacity-50 disabled:cursor-not-allowed text-orange-700 bg-orange-300 disabled:hover:text-orange-700 disabled:hover:bg-orange-300 hover:text-white transition-colors  hover:bg-orange-600 cursor-pointer rounded border-2 flex text-2xl font-semibold py-2 px-4 items-center gap-2">
                            <FaBoxesStacked />
                            Bulk Update
                    </button>
                    <button 
                        onClick={() => setShowExport(true)} 
                        className="text-blue-700 hover:text-white transition-colors bg-blue-300 hover:bg-blue-600 cursor-pointer rounded border-2 flex text-2xl font-semibold py-2 px-4 items-center gap-2">
                            <FaFileExcel className="text-2xl"/>
                            Export Excel
                    </button>
                    <button
                        disabled={student.studNo === null}
                        onClick={handlePrint} 
                        className="disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 bg-slate-300 disabled:hover:text-slate-700 disabled:hover:bg-slate-300 hover:text-white transition-colors  hover:bg-slate-600 cursor-pointer rounded border-2 flex text-2xl font-semibold py-2 px-4 items-center gap-2">
                            <FaPrint className="text-2xl"/
                            >Print
                    </button>
                </div>
            </div>
            {/* Import Modal */}
            {showImport &&
                <div className="w-full h-full absolute items-center justify-center left-0 top-0 flex bg-black/50">
                    <div className="bg-white h-fit px-20 pt-16 pb-5 flex flex-col items-center rounded-lg z-20 shadow-lg/60 justify-center gap-4 text-xl relative">
                        
                        <div className="flex flex-col w-full gap-1">
                            <label className="font-semibold text-2xl text-gray-800" htmlFor="completionDate">Import Student List (xlsx, xls)</label>
                            <div className="flex items-center gap-2 h-full">
                            <input
                                disabled={addStudent.studNo || addStudent.firstName || addStudent.surname || addStudent.course}
                                ref={fileInputRef}
                                className="disabled:opacity-50 bg-gray-100 cursor-pointer file:text-blue-800 border-gray-500 hover:border-black rounded-lg file:font-medium border-2 transition-colors hover:text-white hover:bg-gray-400 hover:file:text-white file:mr-4 pr-4 file:bg-blue-300 file:py-2 file:transition-colors file:px-2 hover:file:bg-blue-500"
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleFileUpload}
                                id="File"
                            />
                            <button className="h-full w-full rounded-lg p-2 border-2 hover:border-black border-gray-500 bg-red-300 hover:bg-red-600 text-red-800 hover:text-white font-semibold transition-all" onClick={() => {
                                setSelectedFile(null);
                                if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                }
                            }}>
                                Clear
                            </button>
                            </div>
                            {selectedFile && <p className="text-gray-500 text-sm">Selected: {selectedFile}</p>}
                        </div>
                        <div className="flex items-center w-full gap-2">
                            <div className="w-full h-0.5 bg-black"/>
                            or
                            <div className="w-full h-0.5 bg-black"/>
                        </div>
                        <div className="flex flex-col w-full gap-2">
                            <label className="font-semibold text-2xl text-gray-800" htmlFor="completionDate">Add a Student</label>
                            <label className="font-semibold text-gray-800 flex flex-col" htmlFor="studNo">
                                Student #: 
                                <input disabled={selectedFile} onChange={e => setAddStudent(prev => ({ ...prev, studNo: e.target.value.toUpperCase() }))} className="disabled:opacity-50 disabled:cursor-not-allowed text-[20px] border-2 border-[#0057B8] text-black bg-white rounded px-2" type="text" value={addStudent.studNo} maxLength={11} pattern="[0-9]+" name="studNo" id="studNo" /> 
                                </label>
                            <label className="font-semibold text-gray-800 flex flex-col" htmlFor="firstName">
                                First Name: 
                                <input disabled={selectedFile} onChange={e => setAddStudent(prev => ({ ...prev, firstName: e.target.value.toUpperCase() }))} className="disabled:opacity-50 disabled:cursor-not-allowed text-[20px] border-2 border-[#0057B8] text-black bg-white rounded px-2" type="text" value={addStudent.firstName} name="firstName" id="firstName" />    
                            </label>
                            <label className="font-semibold text-gray-800 flex flex-col" htmlFor="middleName">
                                Middle Name:
                                <input disabled={selectedFile} onChange={e => setAddStudent(prev => ({ ...prev, middleName: e.target.value.toUpperCase() }))} className="disabled:opacity-50 disabled:cursor-not-allowed text-[20px] border-2 border-[#0057B8] text-black bg-white rounded px-2" type="text" value={addStudent.middleName} name="middleName" id="middleName" />
                            </label>
                            <label className="font-semibold text-gray-800 flex flex-col" htmlFor="lastName">
                                Last Name:
                                <input disabled={selectedFile} onChange={e => setAddStudent(prev => ({ ...prev, surname: e.target.value.toUpperCase() }))} className="disabled:opacity-50 disabled:cursor-not-allowed text-[20px] border-2 border-[#0057B8] text-black bg-white rounded px-2" type="text" value={addStudent.surname} name="lastName" id="lastName" />
                            </label>
                            <label className="font-semibold text-gray-800 flex flex-col" htmlFor="course">
                                Course:
                                <input disabled={selectedFile} onChange={e => setAddStudent(prev => ({ ...prev, course: e.target.value.toUpperCase() }))} className="disabled:opacity-50 disabled:cursor-not-allowed text-[20px] border-2 border-[#0057B8] text-black bg-white rounded px-2" type="text" value={addStudent.course} name="course" id="course" />
                            </label>          
                        </div>
                        <div className="flex flex-col w-full gap-1">
                            <label className="font-semibold text-gray-800" htmlFor="completionDate">Completion Date</label>
                            <DatePicker
                            className="border-2 border-gray-500 hover:border-black focus:outline-none focus:border-blue-500 rounded-lg px-4 py-2 w-full"
                            selected={completionDate}
                            onChange={(date) => setCompletionDate(date)}
                            dateFormat="MMMM d, yyyy"
                            placeholderText="Select date"
                            id="completionDate"
                            />
                        </div>
                            {status && <p>{status}</p>}
                        <button
                            disabled={isImporting || !selectedFile && !(addStudent.studNo && addStudent.firstName && addStudent.surname && addStudent.course)}
                            onClick={handleImportConfirm}
                            className="disabled:opacity-50 bg-green-300 text-green-800 disabled:hover:bg-green-300 disabled:hover:text-green-800 hover:bg-green-500 hover:text-white cursor-pointer rounded border-2 border-white flex font-semibold text-2xl py-2 px-4 items-center gap-2 transition-opacity hover:opacity-100"
                        >
                            <TbDatabaseImport className="text-3xl"/>Import
                        </button>
                        <button disabled={isImporting} className="absolute disabled:opacity-0 cursor-pointer top-2 right-2 text-gray-400 hover:text-black transition-all text-4xl flex justify-center items-center rounded w-10 h-10" onClick={() => setShowImport(false)}>
                            <IoMdArrowRoundBack />
                        </button>
                        <h1 className="absolute cursor-default top-3 left-4 font-semibold text-gray-400 text-3xl flex justify-center items-center rounded">Add Student</h1>
                    </div>
                </div>
            }
            {/* Export Modal */}
            {showExport &&
                <div className="w-full h-full absolute items-center justify-center left-0 top-0 flex bg-black/50">
                    <div className="bg-white h-fit px-20 pt-16 pb-5 flex flex-col items-center rounded-lg shadow-lg/60 justify-center gap-8 text-xl relative">
                        <div className="flex flex-col w-full gap-1">
                            <label className="font-semibold text-gray-800" htmlFor="exportDate">Select Completion Date</label>
                            <input
                                type="number"
                                placeholder="Year e.g. 2026"
                                value={exportYear}
                                onChange={e => setExportYear(e.target.value)}
                                className="border-2 w-full rounded px-2 py-1 text-xl"
                                min="2000"
                                max="2099"
                            />
                        </div>
                        <button
                            onClick={handleExport}
                            className="disabled:opacity-50 bg-blue-300 text-blue-800 disabled:hover:bg-blue-300 disabled:hover:text-blue-800 hover:bg-blue-500 hover:text-white cursor-pointer rounded border-2 border-white flex font-semibold text-2xl py-2 px-4 items-center gap-2 transition-opacity hover:opacity-100"
                        >
                            <TbDatabaseImport className="text-3xl"/>Export
                        </button>
                        <button className="absolute disabled:opacity-0 cursor-pointer top-2 right-2 text-gray-400 hover:text-black transition-all text-4xl flex justify-center items-center rounded w-10 h-10" onClick={() => setShowExport(false)}>
                            <IoMdArrowRoundBack />
                        </button>
                        <h1 className="absolute cursor-default top-3 left-4 font-semibold text-gray-400 text-3xl flex justify-center items-center rounded">Export Student List</h1>
                    </div>
                </div>
            }
            {/* Bulk Update Modal */}
            {showBulk &&
                <div className="w-full h-full absolute items-center justify-center left-0 top-0 flex z-20 bg-black/50">
                    <div className="bg-white h-fit px-20 pt-16 pb-5 flex flex-col items-center rounded-lg shadow-lg/60 justify-center gap-8 text-xl relative">
                        <div className="flex flex-col w-full gap-1">
                            <div className="flex w-full gap-4 items-end">
                                <div>
                                    <label className="font-semibold text-gray-800" htmlFor="exportDate">Choose Department:</label>
                                    <select disabled={sessionStorage.getItem("adminDepartment") !== "Registrar"} onChange={(e) => setDeptFilter(e.target.value)} value={deptFilter} className="border-2 disabled:opacity-50 w-full rounded px-2 py-1 text-xl">
                                        <option value="">All Departments</option>
                                        <option value="Library">Library</option>
                                        <option value="Cashier">Cashier</option>
                                        <option value="HRM Lab">HRM Lab</option>
                                        <option value="Com Lab">Com Lab</option>
                                        <option value="Guidance">Guidance</option>
                                        <option value="ProWare">Proware</option>
                                        <option value="OSA">OSA</option>
                                        <option value="E2E">E2E</option>
                                    </select>
                                </div>
                                <div>
                                    <select onChange={handleDeptChange} className={`print:hidden w-35 cursor-pointer disabled:cursor-not-allowed font-medium disabled:opacity-50 transition-opacity border rounded p-[5px]  ${temporaryStatus == "Submitted" || temporaryStatus == "Cleared" || temporaryStatus == "Paid"  ? "text-green-600 focus:ring-3 focus:border-transparent focus:ring-green-300 focus:outline-0" : temporaryStatus == "N/A" ? "text-gray-600 focus:ring-3 focus:border-transparent focus:ring-gray-300 focus:outline-0" : "text-red-600 focus:ring-3 focus:border-transparent focus:ring-red-300 focus:outline-0"}`} value={temporaryStatus}>
                                        {sessionStorage.getItem("adminDepartment") === "Cashier" ? 
                                        <option className="text-green-600" value="Submitted">Paid</option> 
                                        : 
                                        <option className="text-green-600" value="Submitted">Cleared</option>
                                        }
                                        <option className="text-gray-600" value="N/A">N/A</option>
                                        {sessionStorage.getItem("adminDepartment") === "Cashier" ? <option className="text-red-600" value="Pending">With Bal.</option> : <option className="text-red-600" value="Pending">Pending</option>}
                                    </select>
                                </div>
                            </div>
                            <label className="font-semibold text-gray-800 mt-4" htmlFor="exportDate">Upload Student List:</label>
                            <input
                                className="bg-gray-100 cursor-pointer file:text-blue-800 border-gray-500 hover:border-black rounded-lg file:font-medium border-2 transition-colors hover:text-white hover:bg-gray-400 hover:file:text-white file:mr-4 pr-4 file:bg-blue-300 file:py-2 file:transition-colors file:px-2 hover:file:bg-blue-500"
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleFileBulkUpload}
                                id="File"
                            />
                        </div>
                        <button
                            onClick={handleBulkUpdate}
                            className="disabled:opacity-50 bg-blue-300 text-blue-800 disabled:hover:bg-blue-300 disabled:hover:text-blue-800 hover:bg-blue-500 hover:text-white cursor-pointer rounded border-2 border-white flex font-semibold text-2xl py-2 px-4 items-center gap-2 transition-opacity hover:opacity-100"
                        >
                            <RxUpdate />Update
                        </button>
                        <button className="absolute disabled:opacity-0 cursor-pointer top-2 right-2 text-gray-400 hover:text-black transition-all text-4xl flex justify-center items-center rounded w-10 h-10" onClick={() => setShowBulk(false)}>
                            <IoMdArrowRoundBack />
                        </button>
                        <h1 className="absolute cursor-default top-3 left-4 font-semibold text-gray-400 text-3xl flex justify-center items-center rounded">Bulk Update</h1>
                    </div>
                </div>
            }
        </div>
    )
}
