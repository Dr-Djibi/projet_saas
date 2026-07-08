import fs from 'fs';
import path from 'path';

export class EnvService {
  /**
   * Extrait les clés d'un fichier .env.example et les fusionne avec les valeurs fournies.
   */
  static async generateEnv(targetPath: string, examplePath: string, values: Record<string, string>) {
    if (!fs.existsSync(examplePath)) {
      console.warn(`[EnvService] .env.example non trouvé à ${examplePath}. Génération à partir des valeurs uniquement.`);
      return this.writeEnv(targetPath, values);
    }

    const exampleContent = fs.readFileSync(examplePath, 'utf-8');
    const lines = exampleContent.split('\n');
    const resultLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        resultLines.push(line);
        continue;
      }

      const [key] = trimmed.split('=');
      if (key && values[key.trim()] !== undefined) {
        resultLines.push(`${key.trim()}=${values[key.trim()]}`);
      } else {
        resultLines.push(line);
      }
    }

    // Ajouter les valeurs qui ne sont pas dans l'exemple
    const exampleKeys = lines
      .map(l => l.trim().split('=')[0])
      .filter(k => k && !k.startsWith('#'));

    for (const [key, value] of Object.entries(values)) {
      if (!exampleKeys.includes(key)) {
        resultLines.push(`${key}=${value}`);
      }
    }

    fs.writeFileSync(targetPath, resultLines.join('\n'));
    console.log(`[EnvService] .env généré avec succès à ${targetPath}`);
  }

  static writeEnv(targetPath: string, values: Record<string, string>) {
    const content = Object.entries(values)
      .map(([key, value]) => `${key}="${value.replace(/"/g, '\\"')}"`)
      .join('\n');
    fs.writeFileSync(targetPath, content);
  }


  /**
   * Lit un fichier .env et retourne un objet clé/valeur.
   */
  static readEnv(filePath: string): Record<string, string> {
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, 'utf-8');
    const result: Record<string, string> = {};
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        result[key.trim()] = valueParts.join('=').trim();
      }
    });
    return result;
  }
}
