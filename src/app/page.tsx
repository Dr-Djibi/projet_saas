import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Zap, Shield, Rocket, Activity, CheckCircle2, Clock, Lock, Settings } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function LandingPage() {
  return (
    <div className="relative flex flex-col min-h-screen bg-[#070709] text-white overflow-hidden">
      
      {/* Background Glow effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link className="flex items-center gap-3 group cursor-pointer" href="/">
            <div className="p-2.5 rounded-xl bg-primary/15 group-hover:bg-primary/25 border border-primary/20 transition-all">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white group-hover:text-primary transition-colors">{siteConfig.name}</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/login" className="cursor-pointer">
              <Button className="text-sm font-black text-white hover:text-primary bg-transparent hover:bg-white/5 px-4 h-11 rounded-xl transition-all">
                Connexion
              </Button>
            </Link>
            <Link href="/signup" className="cursor-pointer">
              <Button className="text-sm font-black bg-primary hover:bg-primary/90 text-black px-6 h-11 rounded-xl shadow-lg shadow-primary/15 border-b-2 border-black/20 hover:translate-y-[-1px] active:translate-y-[1px] transition-all">
                S&apos;inscrire
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 container mx-auto px-6 py-16 md:py-28 space-y-32 z-10">
        <section className="w-full flex flex-col items-center text-center space-y-10">
          <div className="space-y-6 max-w-4xl">
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-black text-primary uppercase tracking-widest">
              ⚡ Hébergement Cloud WhatsApp instantané
            </div>
            <h1 className="text-6xl font-black tracking-tighter md:text-8xl leading-[1.05] text-white">
              Hébergez votre Bot WhatsApp <span className="bg-gradient-to-r from-primary via-amber-400 to-yellow-500 bg-clip-text text-transparent">en quelques secondes.</span>
            </h1>
            <p className="mx-auto max-w-2xl text-white/60 md:text-xl font-medium leading-relaxed">
              La plateforme cloud ultime pour propulser et automatiser votre communication sur WhatsApp. Profitez d&apos;une disponibilité permanente, d&apos;une sécurité de haut niveau et d&apos;une gestion simplifiée de vos instances.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
            <Link href="/signup" className="w-full sm:w-auto cursor-pointer">
              <Button size="lg" className="w-full sm:w-auto px-8 h-14 text-base font-black bg-primary hover:bg-primary/95 text-black rounded-2xl shadow-xl shadow-primary/20 border-b-4 border-black/20 active:border-b-0 active:translate-y-[2px] transition-all gap-2">
                Démarrer gratuitement <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto cursor-pointer">
              <Button size="lg" className="w-full sm:w-auto px-8 h-14 text-base font-black border-2 border-white/20 bg-white/5 text-white hover:bg-white hover:text-black rounded-2xl transition-all cursor-pointer">
                Connexion
              </Button>
            </Link>
          </div>

          {/* Interactive Mock Dashboard */}
          <div className="w-full max-w-4xl rounded-[2.5rem] border-2 border-white/10 bg-[#0E0E11]/80 backdrop-blur-xl p-6 md:p-8 shadow-2xl shadow-primary/5 group hover:border-primary/20 transition-all duration-500 text-left">
            <div className="flex items-center justify-between border-b border-white/5 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-white">Tableau de bord bot</h4>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Instance active</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                En ligne
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-xs font-black text-white/40 uppercase tracking-wider flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-primary" /> Stabilité</span>
                <p className="text-xl font-black text-white">99.9% Uptime</p>
              </div>
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-xs font-black text-white/40 uppercase tracking-wider flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" /> Heures actives</span>
                <p className="text-xl font-black text-white">24/7 Illimité</p>
              </div>
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-xs font-black text-white/40 uppercase tracking-wider flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-primary" /> Chiffrement</span>
                <p className="text-xl font-black text-green-400">Sécurisé</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">Tout ce dont vous avez besoin pour vos bots</h2>
            <p className="text-white/60 font-medium max-w-xl mx-auto">
              Une plateforme pensée pour les développeurs et les entreprises souhaitant automatiser leur communication.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {[
              { 
                icon: Zap, 
                title: "Hébergement Instantané", 
                text: "Créez votre compte, connectez votre instance et configurez vos paramètres en quelques clics." 
              },
              { 
                icon: Shield, 
                title: "Sécurité & Confidentialité", 
                text: "Toutes vos sessions, jetons et données de connexion sont chiffrés et sécurisés sur des espaces de stockage isolés." 
              },
              { 
                icon: Rocket, 
                title: "Disponibilité Garantie", 
                text: "Bénéficiez de serveurs cloud robustes qui maintiennent votre bot connecté et réactif 24 heures sur 24." 
              }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-4 p-8 rounded-[2rem] border border-white/5 bg-white/[0.01] hover:border-primary/30 hover:bg-white/[0.03] transition-all duration-300 group">
                <div className="p-4 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-black transition-all">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-black text-white">{feature.title}</h3>
                <p className="text-white/60 font-medium text-sm leading-relaxed">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="max-w-5xl mx-auto rounded-[2.5rem] border border-white/5 bg-white/[0.01] p-8 md:p-12 space-y-12">
          <div className="text-center space-y-3">
            <h3 className="text-3xl font-black">Comment ça marche ?</h3>
            <p className="text-white/60 font-medium max-w-md mx-auto">Lancez votre automatisation en 3 étapes simples.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3 relative group hover:border-primary/20 transition-all">
              <span className="text-4xl font-black text-primary/30 group-hover:text-primary transition-colors">01</span>
              <h4 className="text-lg font-black">Création de compte</h4>
              <p className="text-sm text-white/60 font-medium">Inscrivez-vous gratuitement et accédez immédiatement à votre espace membre.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3 relative group hover:border-primary/20 transition-all">
              <span className="text-4xl font-black text-primary/30 group-hover:text-primary transition-colors">02</span>
              <h4 className="text-lg font-black">Configuration</h4>
              <p className="text-sm text-white/60 font-medium">Choisissez votre configuration (nom, préfixe de commande et numéro propriétaire).</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3 relative group hover:border-primary/20 transition-all">
              <span className="text-4xl font-black text-primary/30 group-hover:text-primary transition-colors">03</span>
              <h4 className="text-lg font-black">Association WhatsApp</h4>
              <p className="text-sm text-white/60 font-medium">Associez votre compte WhatsApp en scannant le code QR fourni, et votre instance est prête.</p>
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="max-w-5xl mx-auto rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-yellow-500/5 to-transparent border border-primary/20 p-8 md:p-16 text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="space-y-4 max-w-2xl mx-auto">
            <h3 className="text-4xl md:text-5xl font-black">Prêt à automatiser vos messages ?</h3>
            <p className="text-white/70 font-bold text-sm md:text-base">
              Rejoignez des centaines d&apos;utilisateurs qui font confiance à notre plateforme cloud pour héberger et maintenir leurs bots WhatsApp 24/7.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/signup" className="cursor-pointer">
              <Button size="lg" className="px-10 h-14 text-base font-black bg-primary hover:bg-primary/90 text-black rounded-2xl shadow-xl shadow-primary/25 border-b-4 border-black/20 active:border-b-0 active:translate-y-[2px] transition-all">
                Créer un compte maintenant
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black/40 backdrop-blur-md">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-white/40 text-sm font-medium">
          <div>
            © {new Date().getFullYear()} {siteConfig.name}. Tous droits réservés.
          </div>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Politique de confidentialité</span>
            <span className="hover:text-white cursor-pointer transition-colors">Conditions générales d&apos;utilisation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}


