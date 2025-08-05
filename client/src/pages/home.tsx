import HeroSection from "@/components/hero-section";

export default function Home() {
  return (
    <div>
      <HeroSection />
      
      {/* Footer */}
      <footer className="py-16 bg-institutional-950 border-t border-institutional-800">
        <div className="container mx-auto px-8">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="legal-seal w-10 h-10 rounded-full flex items-center justify-center">
                  <i className="fas fa-balance-scale text-institutional-950 text-lg"></i>
                </div>
                <div>
                  <div className="font-legal text-xl text-institutional-50">ChittyChain</div>
                  <div className="font-tech text-xs text-legal-gold-500">Evidence Ledger</div>
                </div>
              </div>
              
              <p className="text-institutional-400 max-w-md">
                Immutable forensic evidence management with blockchain verification, 
                ensuring court-admissible documentation and complete chain of custody.
              </p>
              
              <div className="mt-6">
                <span className="text-xs text-institutional-600 font-tech">© 2024 ChittyOS Legal Technology Suite</span>
              </div>
            </div>
            
            <div className="col-span-6">
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <h4 className="font-semibold text-institutional-300 mb-4">Platform</h4>
                  <ul className="space-y-2 text-sm text-institutional-500">
                    <li><a href="#" className="hover:text-legal-gold-500 transition-colors">Evidence Upload</a></li>
                    <li><a href="#" className="hover:text-legal-gold-500 transition-colors">Chain Verification</a></li>
                    <li><a href="#" className="hover:text-legal-gold-500 transition-colors">Contradiction Detection</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-institutional-300 mb-4">Legal</h4>
                  <ul className="space-y-2 text-sm text-institutional-500">
                    <li><a href="#" className="hover:text-legal-gold-500 transition-colors">Court Admissibility</a></li>
                    <li><a href="#" className="hover:text-legal-gold-500 transition-colors">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-legal-gold-500 transition-colors">Terms of Service</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-institutional-300 mb-4">Support</h4>
                  <ul className="space-y-2 text-sm text-institutional-500">
                    <li><a href="#" className="hover:text-legal-gold-500 transition-colors">Documentation</a></li>
                    <li><a href="#" className="hover:text-legal-gold-500 transition-colors">API Reference</a></li>
                    <li><a href="#" className="hover:text-legal-gold-500 transition-colors">Contact</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
