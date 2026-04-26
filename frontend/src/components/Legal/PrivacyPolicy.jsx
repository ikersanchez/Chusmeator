import React from 'react';
import LegalPage from './LegalPage';

const PrivacyPolicy = ({ onClose }) => {
    return (
        <LegalPage title="Política de Privacidad" onClose={onClose}>
            <div className="legal-page">
                <p><strong>Última actualización:</strong> 26 de abril de 2026</p>

                <h2>1. Responsable del Tratamiento</h2>
                <ul>
                    <li><strong>Nombre:</strong> Iker (persona física)</li>
                    <li><strong>NIF:</strong> 12345678A (provisional)</li>
                    <li><strong>Domicilio:</strong> Calle Ejemplo 1, 28001 Madrid, España</li>
                    <li><strong>Email de contacto:</strong> privacidad@chusmeator.es</li>
                </ul>

                <h2>2. Datos que Recopilamos</h2>
                <p>Chusmeator recopila y trata los siguientes datos:</p>
                <ul>
                    <li><strong>Identificador de sesión:</strong> un código pseudónimo generado automáticamente (ej: <code style={{color: '#93c5fd', background: 'rgba(59,130,246,0.15)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.85em'}}>user_a1b2c3d4e5f6</code>) almacenado en una cookie de sesión. No contiene tu nombre ni datos identificativos directos.</li>
                    <li><strong>Contenido generado:</strong> textos de pins, áreas y comentarios que publiques voluntariamente.</li>
                    <li><strong>Datos de uso:</strong> votos emitidos, fechas de creación.</li>
                    <li><strong>Registros de moderación:</strong> resultado (aprobado/rechazado) de la moderación automática de contenido, sin almacenar el texto analizado.</li>
                </ul>
                <p><strong>No recopilamos</strong> nombres, emails, teléfonos, direcciones IP persistentes ni ningún otro dato de carácter personal directo.</p>

                <h2>3. Finalidad del Tratamiento</h2>
                <ul>
                    <li><strong>Funcionamiento del servicio:</strong> identificar tu sesión para que puedas crear, editar y eliminar tu contenido.</li>
                    <li><strong>Moderación de contenido:</strong> analizar automáticamente el texto publicado para prevenir la difusión de datos personales de terceros, contenido ofensivo o indicios delictivos.</li>
                    <li><strong>Prevención de abuso:</strong> limitar la cantidad de contenido que un usuario puede crear por día.</li>
                </ul>

                <h2>4. Base Jurídica</h2>
                <ul>
                    <li><strong>Interés legítimo</strong> (Art. 6.1.f RGPD): para el funcionamiento básico del servicio y la moderación de contenido.</li>
                    <li><strong>Consentimiento</strong> (Art. 6.1.a RGPD): para el uso de la cookie de sesión, que se solicita mediante el banner de cookies antes de acceder al servicio.</li>
                </ul>

                <h2>5. Transferencias Internacionales de Datos</h2>
                <p>El texto publicado por los usuarios se envía a <strong>DeepSeek</strong> (proveedor de inteligencia artificial con sede en China) exclusivamente para la moderación automática de contenido. China no cuenta con una decisión de adecuación de la Comisión Europea.</p>
                <p>Esta transferencia se realiza bajo las garantías del Art. 49.1.b RGPD (necesaria para la ejecución del servicio) y se limita estrictamente al análisis puntual del texto. DeepSeek no almacena los datos procesados según su política de uso de API.</p>

                <h2>6. Plazo de Conservación</h2>
                <ul>
                    <li><strong>Cookie de sesión:</strong> 7 días desde la última visita.</li>
                    <li><strong>Contenido publicado</strong> (pins, áreas, comentarios): hasta que el usuario lo elimine o solicite la supresión de su cuenta.</li>
                    <li><strong>Registros de moderación:</strong> conservados durante un máximo de 12 meses para la prevención de abuso.</li>
                </ul>

                <h2>7. Derechos del Usuario (ARCO-POL)</h2>
                <p>De acuerdo con el RGPD y la LOPDGDD, tienes los siguientes derechos:</p>
                <ul>
                    <li><strong>Acceso:</strong> conocer qué datos tuyos tenemos.</li>
                    <li><strong>Rectificación:</strong> corregir datos inexactos.</li>
                    <li><strong>Supresión</strong> ("derecho al olvido"): eliminar todos tus datos.</li>
                    <li><strong>Oposición:</strong> oponerte al tratamiento de tus datos.</li>
                    <li><strong>Portabilidad:</strong> recibir tus datos en un formato estructurado y legible por máquina.</li>
                    <li><strong>Limitación:</strong> solicitar la restricción del tratamiento.</li>
                </ul>
                <p>Puedes ejercer estos derechos:</p>
                <ul>
                    <li>Enviando un email a <a href="mailto:privacidad@chusmeator.es">privacidad@chusmeator.es</a></li>
                    <li>Eliminando tu cuenta directamente desde la aplicación (próximamente)</li>
                </ul>
                <p>Asimismo, tienes derecho a presentar una reclamación ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong>: <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">www.aepd.es</a></p>

                <h2>8. Medidas de Seguridad</h2>
                <p>Chusmeator implementa las siguientes medidas técnicas para proteger tus datos:</p>
                <ul>
                    <li>Cookies de sesión cifradas y firmadas.</li>
                    <li>Comunicaciones cifradas mediante HTTPS.</li>
                    <li>Moderación automática de contenido para prevenir la publicación de datos personales de terceros.</li>
                    <li>Limitación de acciones por usuario para prevenir abuso.</li>
                    <li>No se almacenan contraseñas ni datos de identificación directa.</li>
                </ul>

                <h2>9. Menores de Edad</h2>
                <p>Chusmeator no está dirigido a menores de 14 años. Si eres menor de 14 años, no utilices este servicio. Si detectamos que un menor ha proporcionado datos personales, los eliminaremos de inmediato.</p>

                <h2>10. Modificaciones</h2>
                <p>Nos reservamos el derecho de modificar esta política de privacidad. Cualquier cambio será publicado en esta misma página con la fecha de actualización correspondiente.</p>
            </div>
        </LegalPage>
    );
};

export default PrivacyPolicy;
