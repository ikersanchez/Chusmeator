import React from 'react';
import LegalPage from './LegalPage';

const LegalNotice = ({ onClose }) => {
    return (
        <LegalPage title="Aviso Legal" onClose={onClose}>
            <div className="legal-page">
                <p><strong>Última actualización:</strong> 26 de abril de 2026</p>

                <h2>1. Datos Identificativos (LSSI-CE Art. 10)</h2>
                <p>En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa al usuario de los siguientes datos del titular de este sitio web:</p>
                <ul>
                    <li><strong>Titular:</strong> Iker (persona física)</li>
                    <li><strong>NIF:</strong> 12345678A (provisional)</li>
                    <li><strong>Domicilio:</strong> Calle Ejemplo 1, 28001 Madrid, España</li>
                    <li><strong>Email de contacto:</strong> contacto@chusmeator.es</li>
                </ul>

                <h2>2. Objeto y Descripción del Servicio</h2>
                <p><strong>Chusmeator</strong> es una aplicación web interactiva que permite a los usuarios publicar textos breves (pins, áreas y comentarios) geolocalizados sobre un mapa. El servicio tiene carácter informativo y de entretenimiento.</p>

                <h2>3. Condiciones de Uso</h2>
                <p>El acceso y uso de Chusmeator implica la aceptación de las presentes condiciones. El usuario se compromete a:</p>
                <ul>
                    <li><strong>No publicar datos personales</strong> de terceros (nombres, direcciones, teléfonos, etc.).</li>
                    <li><strong>No publicar contenido ofensivo</strong>, discriminatorio, racista, sexista o que incite al odio.</li>
                    <li><strong>No publicar información</strong> que pueda facilitar la comisión de delitos (horarios de ausencia de viviendas, venta de sustancias ilegales, etc.).</li>
                    <li><strong>No intentar eludir</strong> los sistemas de moderación o los límites de uso establecidos.</li>
                    <li>Utilizar el servicio de forma ética, responsable y conforme a la legislación vigente.</li>
                </ul>

                <h2>4. Responsabilidad sobre el Contenido</h2>
                <p>Chusmeator actúa como prestador de servicios de intermediación en el sentido del Art. 16 de la LSSI-CE. En consecuencia:</p>
                <ul>
                    <li>El contenido publicado es <strong>responsabilidad exclusiva del usuario</strong> que lo genera.</li>
                    <li>Chusmeator implementa sistemas de moderación automática para detectar y prevenir contenido ilícito, pero <strong>no garantiza</strong> la detección de todos los contenidos potencialmente lesivos.</li>
                    <li>Chusmeator retirará cualquier contenido ilícito en cuanto tenga <strong>conocimiento efectivo</strong> del mismo, conforme al Art. 16 LSSI-CE.</li>
                </ul>

                <h2>5. Notificación de Contenido Ilícito</h2>
                <p>Si consideras que algún contenido publicado en Chusmeator vulnera tus derechos o la legislación vigente, puedes solicitar su retirada enviando un email a <a href="mailto:contacto@chusmeator.es">contacto@chusmeator.es</a> indicando:</p>
                <ul>
                    <li>Descripción del contenido y su ubicación aproximada en el mapa.</li>
                    <li>Motivo de la solicitud de retirada.</li>
                    <li>Tus datos de contacto.</li>
                </ul>
                <p>Nos comprometemos a responder en un plazo máximo de <strong>72 horas</strong>.</p>

                <h2>6. Propiedad Intelectual</h2>
                <p>El código fuente, diseño, logotipos y elementos gráficos de Chusmeator son propiedad de su titular. Los datos cartográficos son proporcionados por <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> bajo la licencia Open Database License (ODbL).</p>
                <p>El contenido generado por los usuarios (textos de pins, áreas y comentarios) es propiedad de cada usuario, quien otorga una licencia de uso no exclusiva a Chusmeator para su publicación en la plataforma.</p>

                <h2>7. Limitación de Responsabilidad</h2>
                <p>Chusmeator no se hace responsable de:</p>
                <ul>
                    <li>La veracidad, exactitud o actualidad del contenido publicado por los usuarios.</li>
                    <li>Los daños o perjuicios que pudieran derivarse del uso del servicio.</li>
                    <li>Las interrupciones del servicio por causas técnicas o de fuerza mayor.</li>
                    <li>El contenido de sitios web de terceros enlazados desde la plataforma.</li>
                </ul>

                <h2>8. Legislación Aplicable y Jurisdicción</h2>
                <p>Las presentes condiciones se rigen por la legislación española. Para cualquier controversia derivada del uso de Chusmeator, las partes se someten a los Juzgados y Tribunales de <strong>Madrid</strong>, salvo que la normativa de protección de consumidores establezca otra jurisdicción.</p>
            </div>
        </LegalPage>
    );
};

export default LegalNotice;
