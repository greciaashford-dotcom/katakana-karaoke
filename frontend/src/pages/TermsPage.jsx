import { LegalLayout } from "@/components/LegalLayout";

export default function TermsPage() {
  return (
    <LegalLayout title="Términos y Condiciones" updated="junio de 2026" testid="terms-page">
      <p>Los presentes Términos y Condiciones regulan el acceso y uso del sitio web de <strong>Okume Karaoke</strong> y de los servicios ofrecidos a través del mismo, de conformidad con la Ley 34/2002 (LSSI-CE) y el Real Decreto Legislativo 1/2007 de defensa de consumidores y usuarios.</p>

      <h2>1. Información general (Aviso legal)</h2>
      <ul>
        <li><strong>Titular:</strong> Okume Karaoke</li>
        <li><strong>Domicilio:</strong> Calle de Coslada, 14, 28028 Madrid (España)</li>
        <li><strong>Contacto:</strong> +34 680 59 03 64 · info@okumekaraoke.com</li>
      </ul>

      <h2>2. Objeto</h2>
      <p>El sitio web permite conocer nuestro local, consultar el catálogo de canciones, solicitar reservas de mesa y realizar peticiones de canciones. La solicitud de reserva constituye una petición sujeta a confirmación por parte de Okume Karaoke según disponibilidad.</p>

      <h2>3. Condiciones de las reservas</h2>
      <ul>
        <li>La reserva no se considera confirmada hasta que recibas nuestra confirmación por teléfono o correo electrónico.</li>
        <li>Okume Karaoke podrá cancelar o modificar reservas por causas justificadas, informando al cliente con la mayor antelación posible.</li>
        <li>Rogamos puntualidad; las mesas podrán liberarse pasados 20 minutos de la hora reservada sin aviso previo.</li>
      </ul>

      <h2>4. Peticiones de canciones</h2>
      <p>Las peticiones de canciones se gestionan por orden de llegada y quedan sujetas a la organización del local. Okume Karaoke se reserva el derecho de moderar o rechazar peticiones con contenido inapropiado.</p>

      <h2>5. Uso del sitio web</h2>
      <p>El usuario se compromete a hacer un uso lícito del sitio, a facilitar información veraz y a no realizar actividades que puedan dañar, sobrecargar o impedir el normal funcionamiento del mismo.</p>

      <h2>6. Propiedad intelectual e industrial</h2>
      <p>Todos los contenidos del sitio (textos, imágenes, logotipos, diseño y catálogo) son titularidad de Okume Karaoke o de terceros que han autorizado su uso, y están protegidos por la normativa de propiedad intelectual e industrial. Queda prohibida su reproducción sin autorización.</p>

      <h2>7. Responsabilidad</h2>
      <p>Okume Karaoke no se responsabiliza de interrupciones, errores u omisiones derivados del funcionamiento técnico del sitio o de causas ajenas a su control.</p>

      <h2>8. Protección de datos</h2>
      <p>El tratamiento de tus datos personales se rige por nuestra <a href="/privacidad">Política de Privacidad</a> y por nuestra <a href="/cookies">Política de Cookies</a>.</p>

      <h2>9. Legislación aplicable y jurisdicción</h2>
      <p>Estos Términos se rigen por la legislación española. Para la resolución de cualquier controversia, las partes se someten a los Juzgados y Tribunales de Madrid, salvo que la normativa de consumidores establezca otro fuero.</p>
    </LegalLayout>
  );
}
