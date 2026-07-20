export type Language = 'es' | 'en' | 'pt' | 'fr';

export interface Dictionary {
  common: {
    appName: string;
    loading: string;
    error: string;
    close: string;
    save: string;
    cancel: string;
    yes: string;
    no: string;
    search: string;
    back: string;
    confirm: string;
  };
  nav: {
    logout: string;
    theme: string;
    light: string;
    dark: string;
    language: string;
  };
  roles: {
    admin: string;
    tecnico: string;
    cliente: string;
  };
  kanban: {
    pendiente: string;
    en_reparacion: string;
    enReparacion: string;
    listo: string;
    entregado: string;
    loading: string;
    error_move: string;
    error_load: string;
  };
  login: {
    title: string;
    subtitle: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    submit: string;
    submitLoading: string;
    invalid: string;
    errorUnknown: string;
    networkError: string;
    footer: string;
  };
  admin: {
    title: string;
    subtitle: string;
    tabs: {
      board: string;
      users: string;
      reception: string;
      newService: string;
    };
    sections: {
      boardTitle: string;
      registerUser: string;
      registeredUsers: string;
      receptionTitle: string;
      createService: string;
      selectClient: string;
      selectTechnician: string;
      selectEquipment: string;
      fullName: string;
      password: string;
      documentId: string;
      email: string;
      phone: string;
      address: string;
      brand: string;
      model: string;
      serial: string;
      problemDesc: string;
      accessories: string;
      serviceDesc: string;
      estimatedCost: string;
      docLabel: string;
      register: string;
      registerReception: string;
      createServiceBtn: string;
    };
    messages: {
      userCreated: string;
      equipmentReceived: string;
      serviceCreated: string;
    };
  };
  tecnico: {
    title: string;
    subtitle: string;
    info: string;
  };
  service: {
    code: string;
    client: string;
    technician: string;
    equipment: string;
    description: string;
    cost: string;
    paid: string;
    pending: string;
    observations: string;
    addObservation: string;
    observationPlaceholder: string;
    noObservations: string;
    pay: string;
    markPaid: string;
    fallbackClient: string;
  };
  cliente: {
    title: string;
    subtitle: string;
    myServices: string;
    info: string;
    searchPlaceholder: string;
    searchButton: string;
    notFound: string;
    status: string;
    statusLabel: string;
    payNow: string;
  };
  payment: {
    title: string;
    method: string;
    amount: string;
    reference: string;
    summary: string;
    equipment: string;
    problem: string;
    serviceLabel: string;
    total: string;
    currency: string;
    phoneOrigin: string;
    holderName: string;
    notes: string;
    placeholderRef: string;
    placeholderPhone: string;
    placeholderName: string;
    error: string;
    submit: string;
  };
}
