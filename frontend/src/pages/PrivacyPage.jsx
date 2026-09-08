import { LegalLayout } from "@/components/LegalLayout";

export default function PrivacyPage() {
  return (
    <LegalLayout title="Política de Privacidad" updated="junio de 2026" testid="privacy-page">
      <p>En <strong>Okume Karaoke</strong> nos comprometemos a proteger tu privacidad y a tratar tus datos personales conforme al Reglamento (UE) 2016/679 (RGPD), la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD) y la Ley 34/2002 de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE).</p>

      <h2>1. Responsable del tratamiento</h2>
      <ul>
        <li><strong>Titular:</strong> Okume Karaoke</li>
        <li><strong>Domicilio:</strong> Calle de Coslada, 14, 28028 Madrid (España)</li>
        <li><strong>Teléfono:</strong> +34 680 59 03 64</li>
        <li><strong>Correo electrónico:</strong> info@okumekaraoke.com</li>
      </ul>

      <h2>2. Datos que recopilamos</h2>
      <p>Tratamos únicamente los datos que nos facilitas voluntariamente:</p>
      <ul>
        <li><strong>Reservas de mesa:</strong> nombre, número de personas, fecha, hora, teléfono, correo electrónico y notas.</li>
        <li><strong>Peticiones de canciones:</strong> nombre (opcional) y correo electrónico.</li>
        <li><strong>Comunicaciones comerciales:</strong> correo electrónico y nombre para el envío de novedades.</li>
        <li><strong>Datos de navegación:</strong> a través de cookies (consulta nuestra Política de Cookies).</li>
      </ul>

      <h2>3. Finalidad del tratamiento</h2>
      <ul>
        <li>Gestionar y confirmar tus reservas de mesa.</li>
        <li>Gestionar tu cola de peticiones de canciones durante tu visita.</li>
        <li>Enviarte un correo de bienvenida y comunicaciones comerciales sobre eventos, promociones y novedades de Okume Karaoke.</li>
        <li>Atender tus consultas y mejorar nuestros servicios.</li>
      </ul>

      <h2>4. Base jurídica (legitimación)</h2>
      <ul>
        <li><strong>Ejecución de una relación de servicio</strong> (art. 6.1.b RGPD) para gestionar reservas y peticiones.</li>
        <li><strong>Consentimiento del interesado</strong> (art. 6.1.a RGPD) para el envío de comunicaciones comerciales, que podrás retirar en cualquier momento.</li>
        <li><strong>Interés legítimo</strong> (art. 6.1.f RGPD) para mejorar la experiencia y la seguridad del servicio.</li>
      </ul>

      <h2>5. Conservación de los datos</h2>
      <p>Conservaremos tus datos mientras exista la relación con Okume Karaoke y no solicites su supresión. Los datos vinculados a comunicaciones comerciales se conservarán hasta que retires tu consentimiento.</p>

      <h2>6. Destinatarios y encargados del tratamiento</h2>
      <p>No cedemos tus datos a terceros salvo obligación legal. Para el envío de correos utilizamos el proveedor <strong>Resend</strong> (Resend, Inc.), que actúa como encargado del tratamiento con las debidas garantías. Puede implicar transferencias internacionales de datos amparadas por las cláusulas contractuales tipo de la Comisión Europea.</p>

      <h2>7. Tus derechos</h2>
      <p>Puedes ejercer en cualquier momento tus derechos de <strong>acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad</strong>, así como revocar tu consentimiento, escribiendo a <a href="mailto:info@okumekaraoke.com">info@okumekaraoke.com</a> indicando el derecho que deseas ejercer. También tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noreferrer">www.aepd.es</a>).</p>

      <h2>8. Seguridad</h2>
      <p>Aplicamos medidas técnicas y organizativas apropiadas para garantizar un nivel de seguridad adecuado al riesgo y proteger tus datos frente a accesos no autorizados, pérdida o alteración.</p>

      <h2>9. Cambios en esta política</h2>
      <p>Podremos actualizar esta Política de Privacidad para adaptarla a novedades legislativas o de servicio. Te recomendamos revisarla periódicamente.</p>
    </LegalLayout>
  );
}
