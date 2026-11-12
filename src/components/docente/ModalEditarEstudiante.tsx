import React, { useEffect, useId, useRef, useState } from 'react';
import { KEY_ADMISSION_COHORTS } from '../../data/cohortsCatalog';
import { claseCampo } from './datos';
import type { UserRecord } from '../../types/exam';

interface ModalEditarEstudianteProps {
  isOpen: boolean;
  onClose: () => void;
  estudiante: UserRecord;
  onGuardar: (datos: { cohort: string; name?: string }) => Promise<void>;
}

interface FormularioEditarEstudianteProps {
  estudiante: UserRecord;
  onGuardar: (datos: { cohort: string; name?: string }) => Promise<void>;
  onCancelar: () => void;
}

const FormularioEditarEstudiante: React.FC<FormularioEditarEstudianteProps> = ({
  estudiante,
  onGuardar,
  onCancelar,
}) => {
  const titleId = useId();
  const [nombre, setNombre] = useState(estudiante.name);
  const [ciclo, setCiclo] = useState(estudiante.cohort || '');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('El nombre no puede estar vacío.');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      await onGuardar({
        name: nombre.trim(),
        cohort: ciclo.trim(),
      });
      onCancelar();
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : 'Error al actualizar los datos del estudiante.';
      setError(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const opcionesCiclo = Array.from(
    new Set([...KEY_ADMISSION_COHORTS, ...(estudiante.cohort ? [estudiante.cohort] : [])]),
  );

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
      <div>
        <h2 id={titleId} className="text-xl sm:text-2xl font-semibold text-key-tinta">
          Editar información del estudiante
        </h2>
        <p className="mt-1 text-sm text-key-texto-suave">
          Actualiza el ciclo de admisión asignado o el nombre del alumno.
        </p>
      </div>

      {error && (
        <p role="alert" className="p-3 border-[0.8px] border-estado-error bg-estado-error-fondo text-estado-error text-sm font-medium">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="edit-estudiante-nombre" className="block text-sm font-medium text-key-tinta mb-1.5">
          Nombre completo
        </label>
        <input
          id="edit-estudiante-nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className={claseCampo}
          required
        />
      </div>

      <div>
        <label htmlFor="edit-estudiante-ciclo" className="block text-sm font-medium text-key-tinta mb-1.5">
          Ciclo de admisión
        </label>
        <select
          id="edit-estudiante-ciclo"
          value={ciclo}
          onChange={(e) => setCiclo(e.target.value)}
          className={claseCampo}
        >
          <option value="">Sin ciclo asignado</option>
          {opcionesCiclo.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-key-texto-suave">
          Selecciona el ciclo al que pertenece el estudiante o déjalo en «Sin ciclo asignado».
        </p>
      </div>

      <div>
        <span className="block text-sm font-medium text-key-texto-suave mb-1">
          Correo electrónico
        </span>
        <p className="text-sm font-mono-num text-key-tinta break-all px-3.5 py-2.5 bg-key-gris-claro border-[0.8px] border-key-negro/30">
          {estudiante.email}
        </p>
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-3 border-t-[0.8px] border-key-negro/20">
        <button
          type="button"
          onClick={onCancelar}
          disabled={guardando}
          className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-5 rounded-full border-[0.8px] border-key-negro bg-key-blanco hover:bg-key-gris-claro text-sm font-semibold text-key-tinta transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={guardando}
          className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-6 rounded-full bg-key-azul hover:bg-key-azul-hover text-sm font-semibold text-key-blanco transition-colors cursor-pointer disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
        >
          {guardando ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
};

export const ModalEditarEstudiante: React.FC<ModalEditarEstudianteProps> = ({
  isOpen,
  onClose,
  estudiante,
  onGuardar,
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const handleBackdropClick = (event: MouseEvent) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isInDialog =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (!isInDialog) {
          dialog.close();
        }
      };

      dialog.addEventListener('click', handleBackdropClick);
      return () => dialog.removeEventListener('click', handleBackdropClick);
    }
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="paa-dialog w-[92vw] max-w-lg overflow-hidden"
    >
      <div className="bg-key-blanco text-key-tinta border-[0.8px] border-key-negro overflow-hidden">
        {isOpen && (
          <FormularioEditarEstudiante
            key={`${estudiante.id}-${estudiante.name}-${estudiante.cohort}`}
            estudiante={estudiante}
            onGuardar={onGuardar}
            onCancelar={() => dialogRef.current?.close()}
          />
        )}
      </div>
    </dialog>
  );
};
