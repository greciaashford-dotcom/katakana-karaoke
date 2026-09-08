import { LegalLayout } from "@/components/LegalLayout";

export default function CookiesPage() {
  return (
    <LegalLayout title="Política de Cookies" updated="junio de 2026" testid="cookies-page">
      <p>Esta Política de Cookies explica qué son las cookies, cuáles utiliza el sitio web de <strong>Okume Karaoke</strong> y cómo puedes gestionarlas, de acuerdo con la Ley 34/2002 (LSSI-CE) y las directrices de la Agencia Española de Protección de Datos.</p>

      <h2>1. ¿Qué son las cookies?</h2>
      <p>Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo cuando los visitas. Sirven para recordar tus preferencias, mejorar tu experiencia y obtener información estadística sobre el uso del sitio.</p>

      <h2>2. Tipos de cookies que utilizamos</h2>
      <table className="legal-table">
        <thead>
          <tr><th>Tipo</th><th>Finalidad</th><th>Duración</th></tr>
        </thead>
        <tbody>
          <tr><td>Técnicas (necesarias)</td><td>Permiten el funcionamiento del sitio y recordar tu decisión sobre el aviso de cookies y tus datos de invitado para pedir canciones.</td><td>Persistente / sesión</td></tr>
          <tr><td>Analíticas (terceros)</td><td>Nos ayudan a entender cómo se utiliza el sitio para mejorarlo. Se activan solo con tu consentimiento.</td><td>Hasta 24 meses</td></tr>
          <tr><td>De terceros</td><td>El widget de reseñas de Google (Elfsight) puede instalar cookies propias de dichos servicios.</td><td>Según el proveedor</td></tr>
        </tbody>
      </table>

      <h2>3. Consentimiento</h2>
      <p>Al acceder al sitio te mostramos un aviso donde puedes <strong>aceptar</strong> o <strong>rechazar</strong> el uso de cookies no necesarias. Las cookies técnicas se instalan por ser imprescindibles para el funcionamiento del sitio.</p>

      <h2>4. Cómo gestionar o eliminar las cookies</h2>
      <p>Puedes permitir, bloquear o eliminar las cookies instaladas en tu dispositivo configurando las opciones de tu navegador:</p>
      <ul>
        <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noreferrer">Google Chrome</a></li>
        <li><a href="https://support.mozilla.org/es/kb/cookies-informacion-que-los-sitios-web-guardan" target="_blank" rel="noreferrer">Mozilla Firefox</a></li>
        <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noreferrer">Safari</a></li>
        <li><a href="https://support.microsoft.com/es-es/microsoft-edge" target="_blank" rel="noreferrer">Microsoft Edge</a></li>
      </ul>
      <p>Ten en cuenta que si desactivas las cookies técnicas algunas funcionalidades del sitio podrían no estar disponibles.</p>

      <h2>5. Actualizaciones</h2>
      <p>Podemos actualizar esta Política de Cookies en función de nuevas exigencias legales o cambios en los servicios utilizados. Para más información sobre el tratamiento de tus datos consulta nuestra <a href="/privacidad">Política de Privacidad</a>.</p>
    </LegalLayout>
  );
}
