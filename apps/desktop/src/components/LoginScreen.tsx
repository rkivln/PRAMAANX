import { useState, FormEvent } from 'react';
export default function LoginScreen({ onLogin, onDemo }: { onLogin: () => void; onDemo: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please enter email and password.');
      return;
    }
    onLogin();
  };

  return (
    <div className="flex flex-row min-h-screen h-screen">
      <div className="w-[40%] bg-navy-dark flex flex-col items-center justify-center px-[40px] py-[48px] border-t-[3px] border-saffron border-b-[3px] border-gov-green relative">
        <div className="w-[96px] h-[96px] rounded-full border-[2px] border-saffron/75 shadow-[0_0_25px_rgba(255,153,51,0.35)] flex items-center justify-center overflow-hidden mb-[20px] bg-[#18191B]">
          <img src="/emblem_logo.jpg" alt="Government of India Emblem" className="w-full h-full object-cover" onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }} />
        </div>
        <div className="text-white/90 text-[13px] font-bold tracking-[1.8px] uppercase text-center">Government of India</div>
        <div className="text-white/46 text-[10px] tracking-[0.7px] uppercase text-center mt-[3px]">Ministry of Home Affairs</div>
        <div className="w-[40px] h-[1px] bg-saffron/30 mx-auto my-[22px]"></div>
        <div className="text-white text-[30px] font-extrabold tracking-[4px] text-center">PRAMAANX</div>
        <div className="text-white/38 text-[11px] text-center mt-[6px] leading-[1.6] max-w-[240px]">AI-Assisted Identity &amp; Document Screening System</div>

        <div className="mt-[36px] flex flex-col gap-[7px] w-full max-w-[260px]">
          <div className="flex items-center gap-[9px] text-white/52 text-[11px]">
            <span className="w-[5px] h-[5px] rounded-full bg-green flex-shrink-0"></span>
            Local Verification Engine
          </div>
          <div className="flex items-center gap-[9px] text-white/52 text-[11px]">
            <span className="w-[5px] h-[5px] rounded-full bg-green flex-shrink-0"></span>
            Online AI Document Analysis
          </div>
          <div className="flex items-center gap-[9px] text-white/52 text-[11px]">
            <span className="w-[5px] h-[5px] rounded-full bg-green flex-shrink-0"></span>
            Biometric Face Verification
          </div>
          <div className="flex items-center gap-[9px] text-white/52 text-[11px]">
            <span className="w-[5px] h-[5px] rounded-full bg-green flex-shrink-0"></span>
            MRZ &amp; Stamp Verification
          </div>
          <div className="flex items-center gap-[9px] text-white/52 text-[11px]">
            <span className="w-[5px] h-[5px] rounded-full bg-green flex-shrink-0"></span>
            Full Immutable Audit Trail
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-[40px] py-[48px] border-t-[3px] border-saffron">
        <div className="w-full max-w-[360px]">
          <div className="text-[17px] font-bold text-text-primary mb-[3px]">Officer Sign In</div>
          <div className="text-[11.5px] text-text-sec mb-[22px]">Authorized government personnel only. Credentials are verified against the personnel database.</div>

          <form onSubmit={handleSubmit}>
            <div className="mb-[13px]">
              <label className="block text-[11px] font-semibold text-text-sec uppercase tracking-[0.4px] mb-[4px]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-[9px] py-[7px] border border-border rounded-[3px] text-[12.5px] text-text-primary bg-white focus:outline-none focus:border-navy-mid focus:shadow-[0_0_0_2px_rgba(30,90,138,0.1)]"
                placeholder="e.g. officer@pramaanx.gov.in"
              />
            </div>
            <div className="mb-[13px]">
              <label className="block text-[11px] font-semibold text-text-sec uppercase tracking-[0.4px] mb-[4px]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-[9px] py-[7px] border border-border rounded-[3px] text-[12.5px] text-text-primary bg-white focus:outline-none focus:border-navy-mid focus:shadow-[0_0_0_2px_rgba(30,90,138,0.1)]"
                placeholder="Enter password"
              />
            </div>

            <div className="flex gap-[8px] mt-[18px]">
              <button type="submit" className="flex-1 bg-navy text-white border border-navy px-[14px] py-[7px] rounded-[3px] text-[12px] font-medium tracking-[0.2px] hover:bg-navy-dark hover:border-navy-dark transition-colors">
                SIGN IN
              </button>
              <button type="button" onClick={onDemo} className="bg-transparent text-text-sec border border-border px-[14px] py-[7px] rounded-[3px] text-[12px] font-medium hover:bg-section hover:text-text-primary transition-colors">
                DEMO / TRAINING MODE
              </button>
            </div>
          </form>

          <div className="flex gap-[12px] mt-[14px] flex-wrap">
            <div className="flex items-center gap-[4px] text-[10px] text-text-muted">
              <span className="w-[4px] h-[4px] rounded-full bg-green"></span>Secure Workstation
            </div>
            <div className="flex items-center gap-[4px] text-[10px] text-text-muted">
              <span className="w-[4px] h-[4px] rounded-full bg-green"></span>Session Auth Enabled
            </div>
            <div className="flex items-center gap-[4px] text-[10px] text-text-muted">
              <span className="w-[4px] h-[4px] rounded-full bg-green"></span>Local Engine Ready
            </div>
          </div>

          <div className="mt-[14px] pt-[12px] border-t border-border text-[10.5px] text-text-muted text-center leading-[1.6]">
            Authorized personnel only. All verification activities are logged and are subject to audit under applicable provisions.
          </div>
        </div>
      </div>
    </div>
  );
}
