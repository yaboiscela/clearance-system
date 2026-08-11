import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import LandingPage from './pages/LandingPage'
import AdminPage from './pages/AdminPage'
import SuperAdminPage from './pages/SuperAdminPage'
import ProtectedRoute from './pages/ProtectedRoute'

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
            alsCert:   row.als_cert,
            alsRating: row.als_rating,
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
const emptyStudent = {
    studNo: null,
    surname: null,
    firstName: null,
    middleName: null,
    email: null,
    phone: null,
    course: null,
    credentials: {
        tor: null,
        goodMoral: null,
        f137: null,
        f138: null,
        alsCert: null,
        alsRating: null,
        honorDism: null,
        birthCert: null,
        xRay: null,
        hepa: null,
    },
    departments: {
        library: null,
        cashier: null,
        hrmLab: null,
        comLab: null,
        guidance: null,
        proware: null,
        osa: null,
        e2e: null,
    },
    subjects: null,
    remarks: null,
    completionDate: null,
    updatedBy: null,
};

function App() {

    const [studNo, setStudNo] = useState('');
    const [notFound, setNotFound] = useState(true);
    const BASE_URL = import.meta.env.VITE_API_URL;
    
    const handleClear = () => {
        console.log("Clearing student data and resetting student number input.");
        setStudent(emptyStudent);
        setStudNo('');
        setNotFound(true);
    }

    const handleSearch = async () => {
        console.log("Initiating search for student number:", studNo);
        try {
            const res = await fetch(`${BASE_URL}/api/students/${studNo}`);
            if (res.status === 404) {
                setNotFound(false);
                setStudent(emptyStudent);
                return;
            }

            const row = await res.json();
            setStudent(mapStudent(row));

        } catch (err) {
            console.error("Search failed:", err);
        }
    };

    const [student, setStudent] = useState(emptyStudent);

    const [showUsers, setShowUsers] = useState(false);

    return (
        <>
            <div className='h-screen '>
            <img className='print:block hidden w-20' src="assets/CALOOCAN.png" alt="" />
            <Routes>
                <Route path="/" element={<Navigate to="/clearance" replace />} />
                <Route path="/clearance" element={<LandingPage student={student} setStudent={setStudent} handleSearch={handleSearch} handleClear={handleClear} studNo={studNo} setStudNo={setStudNo}/>} />
                <Route path="/admin" element={
                    <ProtectedRoute>
                        {sessionStorage.getItem("isSuperAdmin") ?
                            <SuperAdminPage student={student} setStudent={setStudent} handleSearch={handleSearch} handleClear={handleClear} studNo={studNo} setStudNo={setStudNo} setShowUsers={setShowUsers} showUsers={showUsers}/>
                        :
                            <AdminPage student={student} setStudent={setStudent} handleSearch={handleSearch} handleClear={handleClear} studNo={studNo} setStudNo={setStudNo} setShowUsers={setShowUsers} showUsers={showUsers}/>}
                    </ProtectedRoute>
                }
                />
            </Routes>
            <img className='w-full h-full object-cover print:hidden' src="caloocan.jpg" alt=""/>
            </div>
            {notFound || 
                <div className="w-full h-full absolute items-center justify-center left-0 top-0 flex bg-black/50">
                    <div className="bg-slate-500 h-fit px-20 py-10 flex flex-col items-center rounded-lg shadow-lg/60 justify-center gap-8">
                        <h1 className="text-white text-4xl font-bold">Student not found.</h1>
                        <button onClick={() => setNotFound(true)} className="bg-blue-500 hover:bg-blue-800 text-white transition-colors w-35 text-2xl font-semibold border-white border-2 py-[10px] mt-5 cursor-pointer rounded">
                            Ok
                        </button>
                    </div>
                </div>
            }
        </>
    )
}

export default App