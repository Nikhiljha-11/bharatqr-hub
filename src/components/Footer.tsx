import logo from "@/assets/bharatqr-logo.png";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground/70 py-8">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="BharatQR" className="h-8 w-8 rounded bg-primary-foreground/10 object-contain p-0.5" />
          <div>
            <p className="text-sm font-semibold text-primary-foreground">BharatQR — Personal Digital Identity</p>
            <p className="text-xs">Government of India Initiative</p>
          </div>
        </div>
        <div className="flex gap-6 text-xs">
          <a href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary-foreground transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary-foreground transition-colors">Accessibility</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
