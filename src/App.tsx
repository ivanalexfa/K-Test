import React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { SesionProvider } from './estado/SesionContext';
import { useSesion } from './estado/useSesion';
import { ExamenProvider } from './estado/ExamenContext';
import { Cargando } from './paginas/Cargando';
import { PaginaAcceso } from './paginas/PaginaAcceso';
import { PaginaEstudiante } from './paginas/PaginaEstudiante';
import { PaginaDocente } from './paginas/PaginaDocente';
import { PaginaExamen } from './paginas/PaginaExamen';
import { PaginaResultados } from './paginas/PaginaResultados';
import { RequiereCualquierSesion, RequiereSesion } from './paginas/RequiereSesion';
import { rutas } from './rutas';

/**
 * Rutas de K-test. Cada pantalla tiene su URL, «Atrás» funciona y se puede compartir
 * un enlace. Ver docs/general/decisiones/0005-react-router-y-estado.md.
 *
 * | URL                     | Pantalla                         | Quién        |
 * | /                       | Landing (Fase 3); hoy, el acceso | Todos        |
 * | /entrar                 | Acceso con Google o Microsoft    | Todos        |
 * | /inicio/pruebas         | Simulacro y sprints              | Estudiante   |
 * | /inicio/material        | Material de estudio              | Estudiante   |
 * | /inicio/resultados      | Mis resultados                   | Estudiante   |
 * | /examen/:clave          | Examen en curso                  | Estudiante   |
 * | /resultados/:intentoId  | Resultado y solucionario         | Ambos        |
 * | /docente                | Portal del docente               | Docente      |
 */
const Rutas: React.FC = () => {
  const { cargando } = useSesion();
  if (cargando) return <Cargando />;

  return (
    <Routes>
      <Route path={rutas.inicio} element={<PaginaAcceso />} />
      <Route path={rutas.entrar} element={<PaginaAcceso />} />

      <Route element={<RequiereSesion rol="student" />}>
        <Route path={rutas.estudiante} element={<Navigate to={rutas.pruebas} replace />} />
        <Route path={rutas.pruebas} element={<PaginaEstudiante pestana="tests" />} />
        <Route path={rutas.material} element={<PaginaEstudiante pestana="materials" />} />
        <Route path={rutas.misResultados} element={<PaginaEstudiante pestana="history" />} />
        <Route path="/examen/:clave" element={<PaginaExamen />} />
      </Route>

      <Route element={<RequiereSesion rol="teacher" />}>
        <Route path={rutas.docente} element={<PaginaDocente />} />
      </Route>

      <Route element={<RequiereCualquierSesion />}>
        <Route path="/resultados/:intentoId" element={<PaginaResultados />} />
      </Route>

      <Route path="*" element={<Navigate to={rutas.inicio} replace />} />
    </Routes>
  );
};

export const App: React.FC = () => (
  <SesionProvider>
    <ExamenProvider>
      <Rutas />
    </ExamenProvider>
  </SesionProvider>
);

export default App;
