export const ErrorMessages: { [key: string]: string } = {
    "columnas_reportes_fk1": "No se puede eliminar el reporte. Tiene columnas asociadas" ,
    "columnas_reportes_uk1": "Se encuentran columnas con nombre repetido para el reporte",
    "columnas_reportes_fk2": "Error en seleccion del tipo de dato de columna",
    "uq_tablas_valores_items":"Existen dos registros con el mismo dato en el campo 'Valor'",
    "tabla_valores_items_ck1":"El campo 'Valor' en el detalle no puede ser nulo",
    "uq_tablas_valores":"Ya existe una tabla de valores con el mismo nombre para este módulo",
    "demo_fk1":"No se puede eliminar el registro. Tiene registros relacionados en 'DemoFk'"

    // Agrega otros códigos de error y mensajes aquí
  };

  export default ErrorMessages;
