import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Zap, Shield, Rocket } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation - Floating Navbar Rule */}
      <header className="fixed top-4 left-4 right-4 h-16 flex items-center px-6 bg-white/80 backdrop-blur-md border-2 border-primary/20 rounded-2xl z-50 shadow-none">
        <Link className="flex items-center justify-center gap-2 group cursor-pointer" href="/">
          <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">Menma</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-8">
          <Link className="hidden md:block text-sm font-semibold text-foreground/70 hover:text-primary transition-colors cursor-pointer" href="#features">
            Fonctionnalités
          </Link>
          <Link className="hidden md:block text-sm font-semibold text-foreground/70 hover:text-primary transition-colors cursor-pointer" href="#pricing">
            Tarifs
          </Link>
          <Link href="/login" className="cursor-pointer">
            <Button variant="ghost" className="text-sm font-bold hover:bg-primary/5 transition-all">Connexion</Button>
          </Link>
          <Link href="/signup" className="cursor-pointer">
            <Button className="text-sm font-bold bg-primary hover:bg-primary/90 text-white border-b-4 border-primary-foreground/20 active:border-b-0 active:translate-y-[2px] transition-all">S&apos;inscrire</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="w-full py-20 lg:py-32 flex flex-col items-center text-center px-6">
          <div className="space-y-8 max-w-4xl">
            <div className="inline-flex items-center rounded-full border-2 border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-bold text-primary mb-4">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              Maintenant en Beta Publique
            </div>
            <h1 className="text-5xl font-black tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl text-foreground leading-[1.1]">
              Déployez votre Bot WhatsApp <span className="text-primary underline decoration-accent decoration-8 underline-offset-8">en un clic.</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-foreground/70 md:text-xl font-medium leading-relaxed">
              La plateforme ultime pour héberger Menma-MD. Multi-session, ultra-rapide et sécurisée. Gérez vos automatisations comme jamais auparavant.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <Link href="/signup" className="cursor-pointer">
                <Button size="lg" className="h-14 px-10 text-lg font-black gap-2 bg-accent hover:bg-accent/90 text-white border-b-4 border-black/20 active:border-b-0 active:translate-y-[2px] transition-all">
                  Démarrer Gratuitement <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/docs" className="cursor-pointer">
                <Button variant="outline" size="lg" className="h-14 px-10 text-lg font-black border-2 border-primary text-primary hover:bg-primary/5 transition-all">
                  Documentation
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-24 bg-primary/5">
          <div className="container px-6 mx-auto">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="group flex flex-col items-center text-center space-y-6 p-8 rounded-3xl bg-white border-2 border-primary/10 hover:border-primary/30 transition-all cursor-pointer shadow-none">
                <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
                  <Zap className="h-10 w-10 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-black">Déploiement Instantané</h3>
                <p className="text-foreground/60 font-medium">
                  Connectez votre GitHub et déployez votre bot en moins de 60 secondes sur nos serveurs haute performance.
                </p>
              </div>
              <div className="group flex flex-col items-center text-center space-y-6 p-8 rounded-3xl bg-white border-2 border-primary/10 hover:border-primary/30 transition-all cursor-pointer shadow-none">
                <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
                  <Shield className="h-10 w-10 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-black">Multi-Session Sécurisé</h3>
                <p className="text-foreground/60 font-medium">
                  Gérez plusieurs comptes WhatsApp simultanément avec un chiffrement AES-256 de bout en bout pour vos sessions.
                </p>
              </div>
              <div className="group flex flex-col items-center text-center space-y-6 p-8 rounded-3xl bg-white border-2 border-primary/10 hover:border-primary/30 transition-all cursor-pointer shadow-none">
                <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
                  <Rocket className="h-10 w-10 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-black">Évolutivité Totale</h3>
                <p className="text-foreground/60 font-medium">
                  De 1 à 100 bots, notre infrastructure s&apos;adapte à vos besoins sans interruption de service.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing/CTA Section */}
        <section className="w-full py-32">
          <div className="container px-6 mx-auto text-center space-y-12">
            <h2 className="text-4xl font-black tracking-tighter sm:text-6xl">
              Prêt à automatiser vos interactions ?
            </h2>
            <p className="mx-auto max-w-[600px] text-foreground/60 text-xl font-medium">
              Rejoignez des centaines d&apos;utilisateurs qui font confiance à Menma pour leur infrastructure d&apos;automatisation.
            </p>
            <Button size="lg" className="h-16 px-16 text-xl font-black bg-primary hover:bg-primary/90 text-white border-b-4 border-black/20 active:border-b-0 active:translate-y-[2px] transition-all cursor-pointer">
              Créer mon compte maintenant
            </Button>
          </div>
        </section>
      </main>

      <footer className="py-20 bg-foreground text-white px-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <span className="text-2xl font-black">Menma</span>
          </div>
          <p className="text-lg font-medium text-white/60">
            © 2026 Menma. Tous droits réservés.
          </p>
          <div className="flex gap-10">
            <Link className="text-lg font-bold hover:text-primary transition-colors cursor-pointer" href="#">
              CGU
            </Link>
            <Link className="text-lg font-bold hover:text-primary transition-colors cursor-pointer" href="#">
              Confidentialité
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
