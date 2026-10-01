import React, { useState } from 'react';
import { User, Phone, GraduationCap, Building2, Check, AlertCircle } from 'lucide-react';
import { StudentProfile, AcademicStage } from '../types';
import { IRAQI_UNIVERSITIES } from '../data/universities';

interface StudentAuthModalProps {
  profile: StudentProfile;
  isOpen: boolean;
  onSave: (updatedProfile: StudentProfile) => void;
  onClose?: () => void;
  isMandatory?: boolean; // if student must register before ordering
}

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  profile,
  isOpen,
  onSave,
  onClose,
  isMandatory = false,
}) => {
  const [name, setName] = useState(profile.name === 'طالب جامعي' ? '' : profile.name);
  const [phone, setPhone] = useState(profile.phone || '');
  const [university, setUniversity] = useState(profile.university || 'جامعة بغداد');
  const [college, setCollege] = useState(profile.college || 'كلية العلوم');
  const [department, setDepartment] = useState(profile.department || 'قسم الفيزياء');
  const [stage, setStage] = useState<AcademicStage>(profile.stage || 'stage_3');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedUni = IRAQI_UNIVERSITIES.find(u => u.name === university) || IRAQI_UNIVERSITIES[0];
  const availableColleges = selectedUni.colleges;
  const selectedCol = availableColleges.find(c => c.name === college) || availableColleges[0];
  const availableDepartments = selectedCol?.departments || [{ name: 'عام' }];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('يرجى كتابة الاسم الثلاثي (حقل إجباري)');
      return;
    }
    if (!phone.trim()) {
      setError('يرجى كتابة رقم الهاتف للتواصل عبر واتساب (حقل إجباري)');
      return;
    }
    if (phone.trim().length < 10) {
      setError('يرجى كتابة رقم هاتف صحيح يبدأ بـ 07');
      return;
    }

    setError(null);
    onSave({
      ...profile,
      name: name.trim(),
      phone: phone.trim(),
      university,
      college,
      department,
      stage,
      isRegistered: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="text-center pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white flex items-center justify-center mx-auto mb-2 shadow-sm shadow-blue-700/30">
            <GraduationCap className="w-6 h-6 text-blue-200" />
          </div>
          <h2 className="text-lg font-black text-slate-900 font-['Cairo']">
            تسجيل بيانات الطالب
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            املأ بياناتك مرة واحدة لتُعبأ تلقائياً في جميع طلباتك القادمة
          </p>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          
          {/* الاسم الثلاثي */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              الاسم الثلاثي <span className="text-rose-600">* (مطلوب)</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: علي حسن كاظم"
                className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium focus:border-blue-600 focus:outline-none bg-slate-50 focus:bg-white text-xs"
              />
            </div>
          </div>

          {/* رقم الهاتف */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              رقم الهاتف (واتساب للتواصل) <span className="text-rose-600">* (مطلوب)</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07700000000"
                className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium focus:border-blue-600 focus:outline-none bg-slate-50 focus:bg-white text-xs dir-ltr text-right"
              />
            </div>
          </div>

          {/* الجامعة */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              الجامعة <span className="text-rose-600">*</span>
            </label>
            <select
              value={university}
              onChange={(e) => {
                const uName = e.target.value;
                setUniversity(uName);
                const u = IRAQI_UNIVERSITIES.find(uni => uni.name === uName);
                if (u && u.colleges.length > 0) {
                  setCollege(u.colleges[0].name);
                  if (u.colleges[0].departments.length > 0) {
                    setDepartment(u.colleges[0].departments[0].name);
                  }
                }
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium focus:border-blue-600 focus:outline-none bg-white text-xs"
            >
              {IRAQI_UNIVERSITIES.map(u => (
                <option key={u.id} value={u.name}>
                  {u.name} ({u.city})
                </option>
              ))}
            </select>
          </div>

          {/* الكلية والقسم */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-800 mb-1">الكلية</label>
              <select
                value={college}
                onChange={(e) => {
                  const cName = e.target.value;
                  setCollege(cName);
                  const c = availableColleges.find(col => col.name === cName);
                  if (c && c.departments.length > 0) {
                    setDepartment(c.departments[0].name);
                  }
                }}
                className="w-full px-2.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium focus:border-blue-600 focus:outline-none bg-white text-xs truncate"
              >
                {availableColleges.map((c, i) => (
                  <option key={i} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">القسم</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-2.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium focus:border-blue-600 focus:outline-none bg-white text-xs truncate"
              >
                {availableDepartments.map((d, i) => (
                  <option key={i} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* المرحلة */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">المرحلة الدراسية</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as AcademicStage)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium focus:border-blue-600 focus:outline-none bg-white text-xs"
            >
              <option value="stage_1">المرحلة الأولى</option>
              <option value="stage_2">المرحلة الثانية</option>
              <option value="stage_3">المرحلة الثالثة</option>
              <option value="stage_4">المرحلة الرابعة (تخرج)</option>
              <option value="stage_5_6">المرحلة الخامسة / السادسة</option>
              <option value="postgrad">الدراسات العليا (ماجستير / دكتوراه)</option>
            </select>
          </div>

          {/* Submit Action */}
          <div className="pt-3 flex items-center gap-2">
            {!isMandatory && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-50"
              >
                إلغاء
              </button>
            )}

            <button
              type="submit"
              className="flex-1 py-3 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-black text-xs rounded-xl shadow-md shadow-blue-700/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>حفظ البيانات ومتابعة</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
