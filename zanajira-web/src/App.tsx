import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import './i18n/index';

import { ToastProvider } from './components/Toast';

import PublicLayout from './layouts/PublicLayout';
import ApplicantLayout from './layouts/ApplicantLayout';
import AdminLayout from './layouts/AdminLayout';

import VacancyList from './features/public/VacancyList';
import VacancyDetail from './features/public/VacancyDetail';
import Login from './features/public/Login';
import Register from './features/public/Register';
import Activate from './features/public/Activate';
import ForgotPassword from './features/public/ForgotPassword';
import ResetPassword from './features/public/ResetPassword';

import MyApplications from './features/applicant/jobs/MyApplications';
import ApplyFlow from './features/applicant/jobs/ApplyFlow';
import PersonalDetails from './features/applicant/profile/PersonalDetails';
import Declaration from './features/applicant/profile/Declaration';
import CVPreview from './features/applicant/cv/CVPreview';
import ChangePassword from './features/applicant/profile/ChangePassword';
import ContactDetails from './features/applicant/profile/ContactDetails';
import AcademicQualifications from './features/applicant/profile/AcademicQualifications';
import LanguageProficiency from './features/applicant/profile/LanguageProficiency';
import WorkExperience from './features/applicant/profile/WorkExperience';
import ComputerLiteracy from './features/applicant/profile/ComputerLiteracy';

import AdminDashboard from './features/admin/dashboard/AdminDashboard';
import VacancyManagement from './features/admin/management/VacancyManagement';
import VacancyApplicants from './features/admin/management/VacancyApplicants';
import AdminApplicants from './features/admin/management/AdminApplicants';
import AdminStaff from './features/admin/management/AdminStaff';
import GenericCRUD from './features/admin/management/GenericCRUD';
import AuditLogs from './features/admin/management/AuditLogs';
import SystemConfig from './features/admin/config/SystemConfig';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="flex items-center justify-center h-screen font-body text-text-secondary">Inapakia...</div>}>
          <Routes>
            {/* Public */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<VacancyList />} />
              <Route path="/vacancies/:id" element={<VacancyDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/activate" element={<Activate />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            {/* Applicant Portal */}
            <Route element={<ApplicantLayout />}>
              <Route path="/dashboard" element={<VacancyList />} />
              <Route path="/applications" element={<MyApplications />} />
              <Route path="/apply/:id" element={<ApplyFlow />} />
              <Route path="/profile/personal" element={<PersonalDetails />} />
              <Route path="/profile/contact" element={<ContactDetails />} />
              <Route path="/profile/academic" element={<AcademicQualifications />} />
              <Route path="/profile/language" element={<LanguageProficiency />} />
              <Route path="/profile/experience" element={<WorkExperience />} />
              <Route path="/profile/computer" element={<ComputerLiteracy />} />
              <Route path="/profile/declaration" element={<Declaration />} />
              <Route path="/profile/cv" element={<CVPreview />} />
              <Route path="/change-password" element={<ChangePassword />} />
            </Route>

            {/* Admin Portal */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="vacancies" element={<VacancyManagement />} />
              <Route path="vacancies/:id/applicants" element={<VacancyApplicants />} />
              <Route path="applicants" element={<AdminApplicants />} />
              <Route path="staff" element={<AdminStaff />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="config" element={<SystemConfig />} />
              <Route path="employers" element={<GenericCRUD title="Waajiri" endpoint="/admin/employers"
                columns={[{key:'name',label:'Jina'},{key:'contact_email',label:'Barua Pepe'},{key:'contact_phone',label:'Simu'}]}
                createFields={[{key:'name',label:'Jina',required:true},{key:'contact_email',label:'Barua Pepe'},{key:'contact_phone',label:'Simu'},{key:'address',label:'Anwani'}]} />} />
              <Route path="secretariats" element={<GenericCRUD title="Sekretareti" endpoint="/admin/secretariats"
                columns={[{key:'employer',label:'Mwajiri'},{key:'officer_name',label:'Afisa'},{key:'officer_contact',label:'Mawasiliano'}]}
                createFields={[{key:'employer_id',label:'Mwajiri ID',required:true},{key:'officer_name',label:'Jina la Afisa',required:true},{key:'officer_contact',label:'Mawasiliano'}]} />} />
              <Route path="permits" element={<GenericCRUD title="Ruhusa" endpoint="/admin/permits"
                columns={[{key:'employer',label:'Mwajiri'},{key:'status',label:'Hali'},{key:'issued_at',label:'Ilitolewa'}]}
                createFields={[{key:'employer_id',label:'Mwajiri ID',required:true},{key:'vacancy_id',label:'Nafasi ID'}]} />} />
              <Route path="academic-levels" element={<GenericCRUD title="Viwango vya Elimu" endpoint="/admin/academic-levels"
                columns={[{key:'name',label:'Jina'},{key:'sort_order',label:'Mpangilio'}]}
                createFields={[{key:'name',label:'Jina',required:true},{key:'sort_order',label:'Mpangilio',type:'number'}]} />} />
              <Route path="academic-institutions" element={<GenericCRUD title="Taasisi za Elimu" endpoint="/admin/academic-institutions"
                columns={[{key:'name',label:'Jina'},{key:'country',label:'Nchi'},{key:'type',label:'Aina'}]}
                createFields={[{key:'name',label:'Jina',required:true},{key:'country',label:'Nchi'},{key:'type',label:'Aina (ya ndani/nje)'}]} />} />
              <Route path="academic-programmes" element={<GenericCRUD title="Programu za Elimu" endpoint="/admin/academic-programmes"
                columns={[{key:'name',label:'Jina'},{key:'level_name',label:'Kiwango'},{key:'category',label:'Kategoria'}]}
                createFields={[{key:'level_id',label:'Kiwango ID',required:true},{key:'name',label:'Jina la Programu',required:true},{key:'category',label:'Kategoria'}]} />} />
              <Route path="computer-skills" element={<GenericCRUD title="Ujuzi wa Kompyuta" endpoint="/admin/computer-skills"
                columns={[{key:'name',label:'Jina la Ujuzi'}]}
                createFields={[{key:'name',label:'Jina la Ujuzi',required:true}]} />} />
              <Route path="professional-courses" element={<GenericCRUD title="Kozi za Kitaaluma" endpoint="/admin/professional-courses"
                columns={[{key:'name',label:'Jina la Kozi'}]}
                createFields={[{key:'name',label:'Jina la Kozi',required:true}]} />} />
              <Route path="key-matrices" element={<GenericCRUD title="Vipimo Muhimu" endpoint="/admin/key-matrices"
                columns={[{key:'name',label:'Jina'}]}
                createFields={[{key:'name',label:'Jina',required:true}]} />} />
              <Route path="schemes-of-service" element={<GenericCRUD title="Miradi ya Utumishi" endpoint="/admin/schemes-of-service"
                columns={[{key:'grade',label:'Daraja'},{key:'title',label:'Jina'}]}
                createFields={[{key:'grade',label:'Daraja',required:true},{key:'title',label:'Jina',required:true},{key:'qualification_requirements',label:'Mahitaji'},{key:'career_path',label:'Njia ya Kazi'}]} />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;