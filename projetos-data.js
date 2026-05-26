/* ================================================================
   BALI ARQUITETURA — BASE DE PROJETOS
   ================================================================
   Para adicionar um projeto novo, copie o bloco abaixo e cole
   antes do último ]; com as informações reais do projeto.

   Campos obrigatórios:
     id        → identificador único sem espaços ou acentos (usado na URL)
     nome      → nome do projeto como aparece no site
     categoria → Residencial | Interiores | Reforma | Comercial
     tags      → lista de etiquetas para o detalhe do projeto
     capa      → caminho da foto de capa (aparece no card da listagem)
     ano       → ano de conclusão
     area      → área em m²
     local     → cidade e bairro
     descricao → texto descritivo do projeto (parágrafo livre)
     fotos     → lista de caminhos das fotos da galeria

   ----------------------------------------------------------------
   Exemplo de novo projeto:
   {
     id: 'nome-do-projeto',
     nome: 'Nome do Projeto',
     categoria: 'Interiores',
     tags: ['Residencial', 'Interiores'],
     capa: 'assets/img/NOME-DA-FOTO-CAPA.jpg',
     ano: '2025',
     area: '80 m²',
     local: 'Bairro, Rio de Janeiro',
     descricao: 'Descrição do projeto...',
     fotos: [
       'assets/img/FOTO1.jpg',
       'assets/img/FOTO2.jpg',
     ]
   },
   ================================================================ */

const PROJETOS = [
  {
    id: 'apartamento-laranjeiras',
    nome: 'Apartamento Laranjeiras',
    categoria: 'Interiores',
    tags: ['Residencial', 'Interiores', 'Mobiliário sob medida'],
    capa: 'assets/img/sala.png',
    ano: '2024',
    area: '120 m²',
    local: 'Laranjeiras, Rio de Janeiro',
    descricao: 'Projeto de interiores completo para apartamento de casal jovem. A proposta equilibrou funcionalidade e identidade estética, com marcenaria sob medida, paleta neutra em tons de areia e madeira natural, e iluminação indireta planejada para cada ambiente.',
    fotos: [
      'assets/img/sala.png',
      'assets/img/sala2.png',
      'assets/img/hero.png',
    ]
  },
  {
    id: 'casa-gavea',
    nome: 'Casa Gávea',
    categoria: 'Residencial',
    tags: ['Residencial', 'Arquitetura', 'Reforma', 'Fachada'],
    capa: 'assets/img/ext.png',
    ano: '2024',
    area: '380 m²',
    local: 'Gávea, Rio de Janeiro',
    descricao: 'Projeto arquitetônico e reforma completa de residência unifamiliar. A intervenção reorganizou a planta, modernizou a fachada com revestimento natural e integrou as áreas de convivência ao jardim externo, criando fluxo fluído entre interior e exterior.',
    fotos: [
      'assets/img/ext.png',
      'assets/img/hero.png',
      'assets/img/sala2.png',
    ]
  },
  {
    id: 'cozinha-botafogo',
    nome: 'Cozinha Botafogo',
    categoria: 'Reforma',
    tags: ['Residencial', 'Reforma', 'Cozinha', 'Execução'],
    capa: 'assets/img/cozinha.png',
    ano: '2023',
    area: '28 m²',
    local: 'Botafogo, Rio de Janeiro',
    descricao: 'Reforma completa de cozinha com substituição de revestimentos, redesenho de layout e marcenaria planejada. O projeto priorizou a funcionalidade para uma família com rotina ativa, aproveitando ao máximo os 28 m² disponíveis sem comprometer a estética clean.',
    fotos: [
      'assets/img/cozinha.png',
      'assets/img/proj2.png',
      'assets/img/sala.png',
    ]
  },
  {
    id: 'suite-copacabana',
    nome: 'Suíte Copacabana',
    categoria: 'Interiores',
    tags: ['Residencial', 'Interiores', 'Quarto', '2025'],
    capa: 'assets/img/quarto.png',
    ano: '2025',
    area: '22 m²',
    local: 'Copacabana, Rio de Janeiro',
    descricao: 'Redesenho completo de suíte master com foco em aconchego e identidade. Iluminação indireta em sancas, cabeceira estofada sob medida, bancada de trabalho integrada ao closet e revestimento têxtil na parede principal compõem um ambiente íntimo e sofisticado.',
    fotos: [
      'assets/img/quarto.png',
      'assets/img/proj1.png',
      'assets/img/proj3.png',
    ]
  },
  {
    id: 'escritorio-ipanema',
    nome: 'Escritório Ipanema',
    categoria: 'Comercial',
    tags: ['Comercial', 'Interiores', 'Escritório', 'Branding'],
    capa: 'assets/img/proj1.png',
    ano: '2025',
    area: '95 m²',
    local: 'Ipanema, Rio de Janeiro',
    descricao: 'Projeto de design de interiores para escritório de advocacia. O desafio foi criar um ambiente que comunicasse seriedade e sofisticação sem perder conforto. A paleta em cinzas quentes, madeira e cobre resultou em ambientes diferenciados por função: recepção, salas de reunião e estações de trabalho.',
    fotos: [
      'assets/img/proj1.png',
      'assets/img/proj2.png',
      'assets/img/proj3.png',
    ]
  },
  {
    id: 'sala-humaitá',
    nome: 'Sala Humaitá',
    categoria: 'Residencial',
    tags: ['Residencial', 'Interiores', 'Sala de estar'],
    capa: 'assets/img/sala2.png',
    ano: '2023',
    area: '45 m²',
    local: 'Humaitá, Rio de Janeiro',
    descricao: 'Projeto de interiores para sala de estar e jantar integrados. A proposta criou zonas distintas de uso sem barreiras físicas, utilizando tapetes, iluminação e mobiliário como elementos delimitadores. Tons terrosos, texturas naturais e verde nas plantas compõem uma atmosfera acolhedora.',
    fotos: [
      'assets/img/sala2.png',
      'assets/img/sala.png',
      'assets/img/hero.png',
    ]
  },
];
