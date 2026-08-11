import ClearanceStatus from "./ClearanceStatus";

export default function Table({ student, setStudent }) {

    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    const formatDateTime = (dateStr) => {
        return new Date(dateStr).toLocaleString("en-PH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString("en-PH", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const setCredential = (key) => (val) => {
        setStudent(prev => ({
            ...prev,
            credentials: { ...prev.credentials, [key]: val }
        }));
    };
    const setDepartment = (key) => (val) => {
        setStudent(prev => ({
            ...prev,
            departments: { ...prev.departments, [key]: val }
        }));
    };

    const handleSave = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/students/${student.studNo}/update`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    surname:    student.surname,
                    first_name: student.firstName,
                    middle_name: student.middleName,
                    email:      student.email,
                    phone:      student.phone,
                    tor:        student.credentials.tor,
                    good_moral: student.credentials.goodMoral,
                    f137:       student.credentials.f137,
                    f138:       student.credentials.f138,
                    als_cert:   student.credentials.alsCert,
                    als_rating: student.credentials.alsRating,
                    confirmation: student.credentials.confirmation,
                    honor_dism: student.credentials.honorDism,
                    birth_cert: student.credentials.birthCert,
                    x_ray:      student.credentials.xRay,
                    hepa:       student.credentials.hepa,
                    library:    student.departments.library,
                    cashier:    student.departments.cashier,
                    hrm_lab:    student.departments.hrmLab,
                    com_lab:    student.departments.comLab,
                    guidance:   student.departments.guidance,
                    proware:    student.departments.proware,
                    osa:        student.departments.osa,
                    e2e:        student.departments.e2e,
                    subjects:   student.subjects,
                    remarks:    student.remarks,
                    updatedBy:  sessionStorage.getItem("adminName") + " / " + formatDateTime(Date.now())
                }),
            });
            const result = await res.json();
            alert(result.message);

            const updated = await fetch(`${BASE_URL}/api/students/${student.studNo}`);
            const row = await updated.json();
            setStudent({
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
                    alsCert:   row.als_cert,
                    alsRating: row.als_rating,
                    confirmation: row.confirmation,
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
                updatedBy:      row.updated_by,
                completionDate: row.completion_date,
            });

        } catch (err) {
            console.error("Save failed:", err);
            alert("Save failed.");
        }
    };

    const handleNoChange = (e) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        setStudent(prev => ({ ...prev, phone: val }))
    };

    const deptFilter = (department) => {
        if (sessionStorage.getItem("isSuperAdmin") === "true") return true;
        else {
            return department === sessionStorage.getItem("adminDepartment");
        }
    };

    return (
        <div className='rounded-xl w-full overflow-clip h-full print:h-fit bg-[#F4F4F4] print:absolute print:left-0 print:bg-transparent print:border print:mt-20 relative'>
            {
                sessionStorage.getItem("isAdmin") === "true" && location.pathname === "/admin" || sessionStorage.getItem("isSuperAdmin") === "true" && location.pathname === "/admin" ?
                <button disabled={student.studNo === null} onClick={handleSave} className="disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer print:hidden absolute px-4 py-2 text-2xl align-middle font-medium text-green-700 hover:text-white transition-colors bg-green-300 hover:bg-green-600 right-2.5 top-2.5 rounded-md">Save</button>
                :
                null
            }
            <div className='w-full h-full grid-rows-[auto_0.2fr_auto_1fr] grid'>
                <h1 className="text-[32px] print:text-[24px] p-[10px] w-full font-bold text-center text-white bg-[#4A5568]">GRADUATION CLEARANCE</h1>
                {/* Personal Info */}
                <div>
                    {/* Full Name */}
                    <div className="grid grid-cols-[1fr_1.5fr_1fr] pt-[10px] px-[15px]">
                        <div className="flex flex-col">
                            <h1 className="text-[16px] print:text-[12px] font-semibold text-[#4A5568]">Surname</h1>
                            {
                                sessionStorage.getItem("isAdmin") === "true" && location.pathname === "/admin" ?
                                <input disabled={sessionStorage.getItem("adminDepartment") !== "Registrar" || student.surname === null} className="text-[20px] disabled:opacity-50 transition-all print:hidden font-bold text-[#31E1E1E] border-2 px-2 mr-2 rounded border-gray-400 focus:outline-0 focus:ring-2 focus:ring-blue-500 focus:border-0" type="text" name="surname" id="surname" value={student.surname || ""} onChange={e => setStudent(prev => ({ ...prev, surname: e.target.value }))}/>
                                :
                                <h2 className="text-[20px] print:text-[16px] font-bold text-[#31E1E1E]">{student.surname || "--"}</h2>    
                            }
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-[16px] print:text-[12px] font-semibold text-[#4A5568]">First Name</h1>
                            {
                                sessionStorage.getItem("isAdmin") === "true" && location.pathname === "/admin" ?
                                <input disabled={sessionStorage.getItem("adminDepartment") !== "Registrar" || student.firstName === null} className="text-[20px] disabled:opacity-50 transition-all print:hidden font-bold text-[#31E1E1E] border-2 px-2 mr-2 rounded border-gray-400 focus:outline-0 focus:ring-2 focus:ring-blue-500 focus:border-0" type="text" name="firstName" id="firstName" value={student.firstName || ""} onChange={e => setStudent(prev => ({ ...prev, firstName: e.target.value }))}/>
                                :
                                <h2 className="text-[20px] print:text-[16px] font-bold text-[#31E1E1E]">{student.firstName || "--"}</h2>
                            }
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-[16px] print:text-[12px] font-semibold text-[#4A5568]">Middle Name</h1>
                            {
                                sessionStorage.getItem("isAdmin") === "true" && location.pathname === "/admin" ?
                                <input disabled={sessionStorage.getItem("adminDepartment") !== "Registrar" || student.middleName === null} className="text-[20px] disabled:opacity-50 transition-all print:hidden font-bold text-[#31E1E1E] border-2 px-2 mr-2 rounded border-gray-400 focus:outline-0 focus:ring-2 focus:ring-blue-500 focus:border-0" type="text" name="middleName" id="middleName" value={student.middleName || ""} onChange={e => setStudent(prev => ({ ...prev, middleName: e.target.value }))}/>
                                :
                                <h2 className="text-[20px] print:text-[16px] font-bold text-[#31E1E1E]">{student.middleName || "--"}</h2>
                            }
                        </div>
                    </div>
                    {/* Contacts */}
                    <div className="grid grid-cols-[1fr_1fr] py-[10px] px-[15px]">
                        <div className="flex flex-col">
                            <h1 className="text-[16px] print:text-[12px] font-semibold text-[#4A5568]">Email</h1>
                            {sessionStorage.getItem("isAdmin") === "true" || sessionStorage.getItem("isSuperAdmin") === "true" && location.pathname === "/admin" ? 
                                <div>
                                    <input disabled={sessionStorage.getItem("adminDepartment") !== "Registrar" || student.email === null} className="text-[20px] disabled:opacity-50 transition-all print:hidden font-bold text-[#31E1E1E] border-2 px-2 mr-2 rounded border-gray-400 focus:outline-0 focus:ring-2 focus:ring-blue-500 focus:border-0" type="text" name="email" id="email" value={student.email || ""} onChange={e => setStudent(prev => ({ ...prev, email: e.target.value }))}/>
                                    <h2 className="text-[20px] hidden print:block font-bold text-[#31E1E1E]">{student.email || "--"}</h2>
                                </div>
                                :
                                <h2 className="text-[20px] print:text-[16px] font-bold text-[#31E1E1E]">{student.email || "--"}</h2>
                            }
                        </div>  
                        <div className="flex flex-col">
                            <h1 className="text-[16px] print:text-[12px] font-semibold text-[#4A5568]">Phone #</h1>
                            {sessionStorage.getItem("isAdmin") === "true" || sessionStorage.getItem("isSuperAdmin") === "true" && location.pathname === "/admin" ? 
                                <div>
                                    <input disabled={sessionStorage.getItem("adminDepartment") !== "Registrar" || student.phone === null} className="text-[20px] disabled:opacity-50 transition-all print:hidden font-bold text-[#31E1E1E] border-2 px-2 rounded border-gray-400 focus:outline-0 focus:ring-2 focus:ring-blue-500 focus:border-0" type="text" name="phone" id="phone" value={student.phone || ""} onChange={handleNoChange}/>
                                    <h2 className="text-[20px]  print:block hidden font-bold text-[#31E1E1E]">{student.phone || "--"}</h2>
                                </div>
                                :
                                <h2 className="text-[20px] print:text-[16px] font-bold text-[#31E1E1E]">{student.phone || "--"}</h2>
                            }
                        </div>
                    </div>

                </div>
                {/*Course & Strand / Student #*/}
                <h1 className="bg-[#FFCC00] p-[5px] text-center text-[24px] print:text-[18px] text-[#002D72] font-bold">
                    {student.course || "Course / Strand"} - {student.studNo || "2XXXXXXXX"}
                </h1>
                {/* Clearance Status */}
                <div className="grid grid-rows-[0.75fr_1fr_fr] print:grid-cols-auto h-full">
                    {/* Subjects & Remarks */}
                    <div className="grid grid-cols-[0.5fr_1fr] *:w-full text-center border-b-2 *:flex *:items-center *:justify-center print:[&>*:nth-child(even)]:text-[18px] print:[&>*:nth-child(odd)]:text-[18px] [&>*:nth-child(even)]:text-[20px] [&>*:nth-child(odd)]:font-semibold [&>*:nth-child(odd)]:text-[20px] focus:border-0 border-black grid-rows-2 ">
                        <h1 className={`border-t-2 border-r-2 border-black ${sessionStorage.getItem("adminDepartment") !== "Registrar" || student.subjects === null ? "text-gray-500" : "text-black"}`}>Subjects to Enroll</h1>
                        {
                            sessionStorage.getItem("isAdmin") === "true" || sessionStorage.getItem("isSuperAdmin") === "true" && location.pathname === "/admin" ?
                            <input disabled={sessionStorage.getItem("adminDepartment") !== "Registrar" || student.subjects === null ? true : false} onChange={e => setStudent(prev => ({ ...prev, subjects: e.target.value }))} className="text-lg p-3 z-20 disabled:text-gray-500 border-black disabled:cursor-not-allowed border-t-2 focus:outline-0 focus:ring-3 focus:ring-blue-500 focus:border-0" type="text" name="subjects" id="" value={student.subjects || ""} />
                            :
                            <h1 className="border-t-2">{student.subjects || "None"}</h1>
                        }
                        <h1 className={`border-r-2 border-t-2 border-black ${student.remarks === null ? "text-gray-500" : "text-black"}`}>Remarks</h1>
                        {
                            sessionStorage.getItem("isAdmin") === "true" || sessionStorage.getItem("isSuperAdmin") === "true" && location.pathname === "/admin" ?
                            <input disabled={student.remarks === null ? true : false} onChange={e => setStudent(prev => ({ ...prev, remarks: e.target.value }))} className="p-3 z-10 disabled:text-gray-500 disabled:cursor-not-allowed border-t-2 focus:outline-0 focus:ring-3 focus:ring-blue-500 focus:border-0" type="text" name="remarks" id="" value={student.remarks || ""} />
                            :
                            <h1 className="border-t-2">{student.remarks || "None"}</h1>
                        }
                    </div>
                    {/* Credentials */}
                    <div className="text-center grid grid-rows-[auto_auto_auto] border-b-2">
                        <div className="flex items-center justify-center">
                            <h1 className="text-[24px] print:text-[18px] font-semibold text-[#4A5568]">CREDENTIALS</h1>
                        </div>
                        <div className="grid text-[20px] print:text-[16px] grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] [&_h1]:p-2 ">
                            <ClearanceStatus status={student.credentials.tor}       setStatus={setCredential("tor")}       department={!deptFilter("Registrar")} title="TOR"/>
                            <ClearanceStatus status={student.credentials.goodMoral} setStatus={setCredential("goodMoral")} department={!deptFilter("Registrar")} title="Good Moral"/>
                            <ClearanceStatus status={student.credentials.f137}      setStatus={setCredential("f137")}      department={!deptFilter("Registrar")} title="F137"/>
                            <ClearanceStatus status={student.credentials.alsRating} setStatus={setCredential("alsRating")} department={!deptFilter("Registrar")} title="ALS Ratings"/>
                            <ClearanceStatus status={student.credentials.alsCert}   setStatus={setCredential("alsCert")}   department={!deptFilter("Registrar")} title="ALS Certificate"/>
                            <ClearanceStatus status={student.credentials.confirmation}   setStatus={setCredential("confirmation")}   department={!deptFilter("Registrar")} title="Confirmation"/>
                        </div>
                        <div className="grid text-[20px] print:text-[16px] grid-cols-[1fr_1fr_1fr_1fr_1fr] [&_h1]:p-2">
                            <ClearanceStatus status={student.credentials.f138}      setStatus={setCredential("f138")}      department={!deptFilter("Registrar")} title="F138"/>
                            <ClearanceStatus status={student.credentials.birthCert} setStatus={setCredential("birthCert")} department={!deptFilter("Registrar")} title="Birth Certificate"/>
                            <ClearanceStatus status={student.credentials.honorDism} setStatus={setCredential("honorDism")} department={!deptFilter("Registrar")} title="Honorable Dismissal"/>
                            <ClearanceStatus status={student.credentials.xRay}  setStatus={setCredential("xRay")}  department={!deptFilter("Registrar")} title="Chest X-Ray"/>
                            <ClearanceStatus status={student.credentials.hepa}      setStatus={setCredential("hepa")}      department={!deptFilter("Registrar")} title="Hepa"/>
                        </div>
                    </div>
                    {/* Departments */}
                    <div className="text-center grid grid-rows-[0.5fr_1fr_1fr_0.25fr] print:grid-cols-auto">
                        <div className="flex items-center justify-center">
                            <h1 className="text-[24px] print:text-[18px] font-semibold text-[#4A5568]">DEPARTMENTS</h1>
                        </div>
                        <div className="grid text-[20px] print:text-[16px] grid-cols-[1fr_1fr_1fr_1fr] [&_h1]:p-2">
                            <ClearanceStatus status={student.departments.library}  setStatus={setDepartment("library")}  alt={true} department={!deptFilter("Library")}  title="Library"/>
                            <ClearanceStatus status={student.departments.cashier}  setStatus={setDepartment("cashier")}  alt={true} cashier={true} department={!deptFilter("Cashier")}  title="Cashier"/>
                            <ClearanceStatus status={student.departments.hrmLab}   setStatus={setDepartment("hrmLab")}   alt={true} department={!deptFilter("HRM Lab")}  title="HRM Lab"/>
                            <ClearanceStatus status={student.departments.comLab}   setStatus={setDepartment("comLab")}   alt={true} department={!deptFilter("Com Lab")}  title="Com Lab"/>
                        </div>
                        <div className="grid text-[20px] print:text-[16px] grid-cols-[1fr_1fr_1fr_1fr] [&_h1]:p-2">
                            <ClearanceStatus status={student.departments.guidance} setStatus={setDepartment("guidance")} alt={true} department={!deptFilter("Guidance")} title="Guidance"/>
                            <ClearanceStatus status={student.departments.proware}  setStatus={setDepartment("proware")}  alt={true} department={!deptFilter("ProWare")}  title="ProWare"/>
                            <ClearanceStatus status={student.departments.osa}      setStatus={setDepartment("osa")}      alt={true} department={!deptFilter("OSA")}      title="OSA"/>
                            <ClearanceStatus status={student.departments.e2e}      setStatus={setDepartment("e2e")}      alt={true} department={!deptFilter("E2E")}      title="E2E"/>
                        </div>
                        <div className="grid grid-cols-[0.75fr_1fr] text-[16px] text-white bg-[#002D72]">
                            <div className="flex w-full justify-center gap-2 p-[10px]">
                                <h1 className="font-bold">COMPLETION DATE: </h1>
                                <h2>{formatDate(student.completionDate) || "--"}</h2>
                            </div>
                            <div className="flex w-full justify-center gap-2 p-[10px]">
                                <h1 className="font-bold">UPDATED BY: </h1>
                                <h2>{student.updatedBy || "--"}</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}