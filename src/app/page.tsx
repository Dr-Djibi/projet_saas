import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Zap, Shield, Rocket } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function LandingPage() {
  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground">
      
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full bg-black/50 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link className="flex items-center gap-2 group cursor-pointer" href="/">
            <div className="p-1.5 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">{siteConfig.name}</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="cursor-pointer">
              <Button variant="ghost" className="text-sm font-bold text-muted-foreground hover:text-foreground">Connexion</Button>
            </Link>
            <Link href="/signup" className="cursor-pointer">
              <Button className="text-sm font-bold bg-primary text-black hover:bg-primary/90">S&apos;inscrire</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 md:py-24">
        {/* Hero */}
        <section className="w-full flex flex-col items-center text-center">
          <div className="space-y-8 max-w-4xl">
            <h1 className="text-5xl font-black tracking-tighter md:text-7xl leading-[1.1]">
              Déployez votre Bot WhatsApp <span className="text-primary">en un clic.</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl font-medium">
              La plateforme ultime pour héberger votre bot. Multi-session, ultra-rapide et sécurisée.
            </p>
            <div className="flex gap-4 justify-center pt-8">
              <Link href="/signup" className="cursor-pointer">
                <Button size="lg" className="font-bold bg-primary text-black hover:bg-primary/90">
                  Démarrer Gratuitement <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="w-full py-24">
          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {[
              { icon: Zap, title: "Déploiement Instantané", text: "Moins de 60 secondes sur nos serveurs." },
              { icon: Shield, title: "Multi-Session Sécurisé", text: "Chiffrement AES-256 de bout en bout." },
              { icon: Rocket, title: "Évolutivité Totale", text: "S'adapte à tous vos besoins." }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-4 p-8 rounded-3xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all">
                <feature.icon className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-black">{feature.title}</h3>
                <p className="text-muted-foreground font-medium">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground font-medium">
          © {new Date().getFullYear()} {siteConfig.name}. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
