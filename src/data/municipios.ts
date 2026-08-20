/**
 * Catastro de municipios chilenos: sitios web, Facebook, Instagram.
 * Fuente: Asociación Nacional de la Prensa (ANP)
 * Actualización: 2026-08-19
 *
 * Los municipios publican eventos de congregación masiva en sus canales:
 * - Fiestas locales, festivales, celebraciones
 * - Eventos públicos, conciertos, ferias
 * - Actividades comunitarias
 */

export interface MunicipioConfig {
  region: string;
  comuna: string;
  facebook?: string;
  instagram?: string;
  sitioWeb?: string;
  notas?: string;
}

export const MUNICIPIOS: MunicipioConfig[] = [
  // Región Metropolitana de Santiago
  {
    region: "Metropolitana",
    comuna: "Colina",
    facebook: "https://www.facebook.com/MunicipalidadColina",
    instagram: "https://www.instagram.com/municolina/",
    sitioWeb: "https://www.colina.cl/",
  },
  {
    region: "Metropolitana",
    comuna: "Conchali",
    facebook: "https://www.facebook.com/MuniConchali",
    instagram: "https://www.instagram.com/municipalidadconchali/",
    sitioWeb: "https://www.conchali.cl",
  },
  {
    region: "Metropolitana",
    comuna: "Estación Central",
    facebook: "https://www.facebook.com/muniecentral",
    instagram: "https://www.instagram.com/culturalestacioncentral/",
    sitioWeb: "https://www.municipalidaddeestacioncentral.cl",
  },
  {
    region: "Metropolitana",
    comuna: "Independencia",
    facebook: "https://www.facebook.com/M.Independencia",
    instagram: "https://www.instagram.com/muni_independencia/",
    sitioWeb: "https://www.independencia.cl/",
  },
  {
    region: "Metropolitana",
    comuna: "La Florida",
    facebook: "https://www.facebook.com/munilaflorida",
    instagram: "https://www.instagram.com/munilaflorida_/",
    sitioWeb: "http://www.laflorida.cl/",
  },
  {
    region: "Metropolitana",
    comuna: "La Reina",
    facebook: "https://www.facebook.com/MuniLaReina",
    instagram: "https://www.instagram.com/munilareina/",
    sitioWeb: "https://www.lareina.cl/",
  },
  {
    region: "Metropolitana",
    comuna: "Las Condes",
    facebook: "https://www.facebook.com/munilascondes",
    instagram: "https://www.instagram.com/munilascondes/",
    sitioWeb: "http://www.lascondes.cl/",
  },
  {
    region: "Metropolitana",
    comuna: "Lo Barnechea",
    facebook: "https://www.facebook.com/MLoBarnechea",
    instagram: "https://www.instagram.com/mlobarnechea/",
    sitioWeb: "http://www.lobarnechea.cl/",
  },
  {
    region: "Metropolitana",
    comuna: "Macul",
    facebook: "https://www.facebook.com/muni.macul",
    instagram: "https://www.instagram.com/muni_macul/",
    sitioWeb: "https://www.munimacul.cl/",
  },
  {
    region: "Metropolitana",
    comuna: "Maipú",
    sitioWeb: "http://www.municipalidadmaipu.cl/",
    notas: "Sin Facebook ni Instagram activos",
  },
  {
    region: "Metropolitana",
    comuna: "Melipilla",
    facebook: "https://www.facebook.com/municipiomelipilla",
    instagram: "https://www.instagram.com/municipiomelipilla2/",
    sitioWeb: "http://www.melipilla.cl",
  },
  {
    region: "Metropolitana",
    comuna: "Ñuñoa",
    facebook: "https://www.facebook.com/muninunoacl",
    instagram: "https://www.instagram.com/muninunoa/",
    sitioWeb: "https://www.nunoa.cl",
  },
  {
    region: "Metropolitana",
    comuna: "Peñalolén",
    facebook: "https://www.facebook.com/munipena",
    instagram: "https://www.instagram.com/penalolen/",
    sitioWeb: "http://www.penalolen.cl",
  },
  {
    region: "Metropolitana",
    comuna: "Providencia",
    facebook: "https://www.facebook.com/MunicipalidadDeProvidencia",
    instagram: "https://www.instagram.com/muniprovi/",
    sitioWeb: "http://www.providencia.cl/",
  },
  {
    region: "Metropolitana",
    comuna: "Pudahuel",
    sitioWeb: "http://www.mpudahuel.cl/sitio",
    notas: "Sin Facebook ni Instagram activos",
  },
  {
    region: "Metropolitana",
    comuna: "Puente Alto",
    instagram: "https://www.instagram.com/mpuentealto/",
    sitioWeb: "http://www.mpuentealto.cl",
    notas: "Sin Facebook activo",
  },
  {
    region: "Metropolitana",
    comuna: "Quilicura",
    sitioWeb: "https://www.municipalidadquilicura.cl/",
    notas: "Sin Facebook ni Instagram activos",
  },
  {
    region: "Metropolitana",
    comuna: "Recoleta",
    facebook: "https://www.facebook.com/MunicipalidadDeRecoleta",
    instagram: "https://www.instagram.com/municipalidadrecoleta/",
    sitioWeb: "http://www.recoleta.cl/",
  },
  {
    region: "Metropolitana",
    comuna: "Renca",
    facebook: "https://www.facebook.com/MuniRenca",
    instagram: "https://www.instagram.com/muni_renca/",
    sitioWeb: "http://www.renca.cl/",
  },
  {
    region: "Metropolitana",
    comuna: "San Bernardo",
    facebook: "https://www.facebook.com/sanbernardocl",
    instagram: "https://www.instagram.com/sanbernardocl/",
    sitioWeb: "https://www.sanbernardo.cl/",
  },
  {
    region: "Metropolitana",
    comuna: "San Miguel",
    sitioWeb: "http://www.sanmiguel.cl/",
    notas: "Sin Facebook ni Instagram activos",
  },
  {
    region: "Metropolitana",
    comuna: "Santiago",
    facebook: "https://www.facebook.com/munistgo",
    instagram: "https://www.instagram.com/munistgo/",
    sitioWeb: "http://www.municipalidaddesantiago.cl/",
  },
  {
    region: "Metropolitana",
    comuna: "Talagante",
    sitioWeb: "http://www.munitalagante.cl",
    notas: "Sin Facebook ni Instagram activos",
  },
  {
    region: "Metropolitana",
    comuna: "Vitacura",
    facebook: "https://www.facebook.com/vitacura",
    instagram: "https://www.instagram.com/vitacura_/",
    sitioWeb: "http://www.vitacura.cl:80/",
  },

  // Región de Antofagasta
  {
    region: "Antofagasta",
    comuna: "Antofagasta",
    facebook: "https://www.facebook.com/Municipalidad.Antofagasta",
    instagram: "https://www.instagram.com/antofagastamuni/",
    sitioWeb: "https://www.municipalidadantofagasta.cl/",
  },
  {
    region: "Antofagasta",
    comuna: "Calama",
    facebook: "https://www.facebook.com/municalama",
    instagram: "https://www.instagram.com/municipalidadcalama2024/",
    sitioWeb: "https://www.municipalidadcalama.cl/",
  },
  {
    region: "Antofagasta",
    comuna: "Tocopilla",
    facebook: "https://www.facebook.com/MunicipalidadDeTocopilla",
    instagram: "https://www.instagram.com/munitocopilla/",
    sitioWeb: "https://imtocopilla.cl/",
  },

  // Región de Arica y Parinacota
  {
    region: "Arica y Parinacota",
    comuna: "Arica",
    facebook: "https://www.facebook.com/MunicipalidaddeArica",
    instagram: "https://www.instagram.com/muniarica/",
    sitioWeb: "https://www.muniarica.cl/",
  },

  // Región de Atacama
  {
    region: "Atacama",
    comuna: "Caldera",
    facebook: "https://www.facebook.com/Municipiocaldera/",
    instagram: "https://www.instagram.com/municipiocaldera/",
    sitioWeb: "https://www.caldera.cl",
  },
  {
    region: "Atacama",
    comuna: "Copiapó",
    facebook: "https://www.facebook.com/MuniCopiapo/",
    instagram: "https://www.instagram.com/municipalidadcopiapo/",
    sitioWeb: "https://copiapo.cl/",
  },
  {
    region: "Atacama",
    comuna: "Huasco",
    facebook: "https://www.facebook.com/munihuasco/",
    instagram: "https://www.instagram.com/munihuasco/",
    sitioWeb: "http://www.imhuasco.cl/",
  },
  {
    region: "Atacama",
    comuna: "Vallenar",
    facebook: "https://www.facebook.com/munidevallenar",
    instagram: "https://www.instagram.com/munivallenar/",
    sitioWeb: "https://www.imvallenar.gob.cl/",
  },

  // Región de Aysén
  {
    region: "Aysén",
    comuna: "Aysen",
    facebook: "https://www.facebook.com/muniaysen",
    instagram: "https://www.instagram.com/muniaysen/",
    sitioWeb: "http://www.puertoaysen.cl",
  },
  {
    region: "Aysén",
    comuna: "Coyhaique",
    facebook: "https://www.facebook.com/municoyhaique",
    instagram: "https://www.instagram.com/municoyhaique/",
    sitioWeb: "https://www.coyhaique.cl/",
  },

  // Región de Coquimbo
  {
    region: "Coquimbo",
    comuna: "Coquimbo",
    facebook: "https://www.facebook.com/municoquimbo",
    sitioWeb: "https://www.municoquimbo.cl/",
    notas: "Sin Instagram activo",
  },
  {
    region: "Coquimbo",
    comuna: "Illapel",
    facebook: "https://www.facebook.com/municipalidad.deillapel",
    sitioWeb: "https://municipalidadillapel.cl/",
    notas: "Sin Instagram activo",
  },
  {
    region: "Coquimbo",
    comuna: "La Serena",
    facebook: "https://www.facebook.com/Munilaserena",
    instagram: "https://www.instagram.com/muni_laserena/",
    sitioWeb: "https://laserena.cl/",
  },
  {
    region: "Coquimbo",
    comuna: "Ovalle",
    facebook: "https://www.facebook.com/Municipalidadovalle",
    instagram: "https://www.instagram.com/muniovalle/",
    sitioWeb: "https://www.municipalidadovalle.cl/",
  },
  {
    region: "Coquimbo",
    comuna: "Paihuano",
    facebook: "https://www.facebook.com/municipalidad.paihuano",
    instagram: "https://www.instagram.com/muni.paihuano/",
    sitioWeb: "https://www.munipaihuano.cl/",
  },
  {
    region: "Coquimbo",
    comuna: "Salamanca",
    facebook: "https://www.facebook.com/municipalidaddesalamanca",
    instagram: "https://www.instagram.com/munisalamanca/",
    sitioWeb: "http://www.salamanca.cl",
  },
  {
    region: "Coquimbo",
    comuna: "Vicuña",
    sitioWeb: "https://munivicuna.cl/",
    notas: "Sin Facebook ni Instagram activos",
  },

  // Región de La Araucanía
  {
    region: "La Araucanía",
    comuna: "Angol",
    facebook: "https://www.facebook.com/municipalidad.angol",
    instagram: "https://www.instagram.com/municipalidad_angol/",
    sitioWeb: "https://www.angol.cl/",
  },
  {
    region: "La Araucanía",
    comuna: "Padre Las Casas",
    facebook: "https://www.facebook.com/municipiopadrelascasas",
    instagram: "https://www.instagram.com/municipiopadrelascasas/",
    sitioWeb: "https://www.padrelascasas.cl/newplc/",
  },
  {
    region: "La Araucanía",
    comuna: "Pucón",
    facebook: "https://www.facebook.com/municipalidadpuconchile",
    instagram: "https://www.instagram.com/munipuconcl/",
    sitioWeb: "http://www.municipalidadpucon.cl/",
  },
  {
    region: "La Araucanía",
    comuna: "Temuco",
    facebook: "https://www.facebook.com/municipiotemuco",
    instagram: "https://www.instagram.com/munitemuco/",
    sitioWeb: "https://www.temuco.cl/",
  },
  {
    region: "La Araucanía",
    comuna: "Villarrica",
    facebook: "https://www.facebook.com/munivillarricaoficial",
    instagram: "https://www.instagram.com/villarricamuni/",
    sitioWeb: "https://www.munivillarrica.cl/",
  },

  // Región de Los Lagos
  {
    region: "Los Lagos",
    comuna: "Castro",
    facebook: "https://www.facebook.com/ilustremunicipalidaddecastro",
    instagram: "https://www.instagram.com/ilustremunicipalidaddecastro/",
    sitioWeb: "https://www.municipalidadcastro.cl/",
  },
  {
    region: "Los Lagos",
    comuna: "Puerto Montt",
    instagram: "https://www.instagram.com/municipalidadpuertomontt/",
    sitioWeb: "https://www.puertomontt.cl/",
    notas: "Sin Facebook activo",
  },

  // Región de Los Ríos
  {
    region: "Los Ríos",
    comuna: "La Unión",
    sitioWeb: "http://www.munilaunion.cl/",
    notas: "Sin Facebook ni Instagram activos",
  },
  {
    region: "Los Ríos",
    comuna: "Valdivia",
    facebook: "https://www.facebook.com/municipalidaddevaldivia",
    instagram: "https://www.instagram.com/munivaldivia/",
    sitioWeb: "https://munivaldivia.cl/",
  },

  // Región de Magallanes
  {
    region: "Magallanes",
    comuna: "Natales",
    facebook: "https://www.facebook.com/natalesilustremunicipalidad",
    instagram: "https://www.instagram.com/muni_natales/",
    sitioWeb: "http://www.muninatales.cl",
  },
  {
    region: "Magallanes",
    comuna: "Punta Arenas",
    sitioWeb: "https://www.puntaarenas.cl/",
    notas: "Sin Facebook ni Instagram activos",
  },

  // Región de O'Higgins
  {
    region: "O'Higgins",
    comuna: "Rancagua",
    facebook: "https://www.facebook.com/munirancagua",
    instagram: "https://www.instagram.com/munirancagua/",
    sitioWeb: "https://munirancagua.gob.cl/",
  },
  {
    region: "O'Higgins",
    comuna: "San Fernando",
    facebook: "https://www.facebook.com/muni.sanfernando",
    instagram: "https://www.instagram.com/muni.sanfernando/",
    sitioWeb: "https://municipalidadsanfernando.cl/",
  },

  // Región de Tarapacá
  {
    region: "Tarapacá",
    comuna: "Alto Hospicio",
    sitioWeb: "http://www.maho.cl/mh09/",
    notas: "Sin Facebook ni Instagram activos",
  },
  {
    region: "Tarapacá",
    comuna: "Iquique",
    facebook: "https://www.facebook.com/IMIIQQ",
    instagram: "https://www.instagram.com/municipalidad_iquique/",
    sitioWeb: "https://www.municipioiquique.cl/",
  },

  // Región de Valparaíso
  {
    region: "Valparaíso",
    comuna: "Los Andes",
    instagram: "https://www.instagram.com/munilosandes/",
    sitioWeb: "https://www.losandes.cl/",
    notas: "Sin Facebook activo",
  },
  {
    region: "Valparaíso",
    comuna: "Quillota",
    sitioWeb: "https://secmuquillota.cl/index2.php",
    notas: "Sin Facebook ni Instagram activos",
  },
  {
    region: "Valparaíso",
    comuna: "Quilpué",
    sitioWeb: "https://muniquilpue.gob.cl:443/",
    notas: "Sin Facebook ni Instagram activos",
  },
  {
    region: "Valparaíso",
    comuna: "San Antonio",
    facebook: "https://www.facebook.com/muni.sanantoniocl",
    instagram: "https://www.instagram.com/muni.sanantoniocl/",
    sitioWeb: "https://www.sanantonio.cl/",
  },
  {
    region: "Valparaíso",
    comuna: "San Felipe",
    facebook: "https://www.facebook.com/MuniSanFelipe",
    instagram: "https://www.instagram.com/munisanfelipe/",
    sitioWeb: "https://munisanfelipe.cl/",
  },
  {
    region: "Valparaíso",
    comuna: "Valparaíso",
    facebook: "https://www.facebook.com/Municipiovalpo",
    instagram: "https://www.instagram.com/municipiovalpo/",
    sitioWeb: "https://municipalidaddevalparaiso.cl/",
  },

  // Región de Ñuble
  {
    region: "Ñuble",
    comuna: "Chillán",
    facebook: "https://www.facebook.com/municipalidad.d.chillan",
    instagram: "https://www.instagram.com/municipalidadchillan/",
    sitioWeb: "https://www.municipalidadchillan.cl/sitio/",
  },

  // Región del Biobío
  {
    region: "Biobío",
    comuna: "Concepción",
    facebook: "https://www.facebook.com/MuniConce",
    instagram: "https://www.instagram.com/muni_conce/",
    sitioWeb: "https://concepcion.cl/",
  },
  {
    region: "Biobío",
    comuna: "Coronel",
    facebook: "https://www.facebook.com/Municipalidad-Coronel-1146045712158486",
    instagram: "https://www.instagram.com/coronelmuni/",
    sitioWeb: "http://www.coronel.cl/",
  },
  {
    region: "Biobío",
    comuna: "Los Ángeles",
    facebook: "https://www.facebook.com/Munilosangeles",
    instagram: "https://www.instagram.com/munilosangeles/",
    sitioWeb: "http://www.losangeles.cl/",
  },
  {
    region: "Biobío",
    comuna: "Talcahuano",
    facebook: "https://www.facebook.com/MunicipalidaddeTalcahuano",
    instagram: "https://www.instagram.com/municipalidadtalcahuano/",
    sitioWeb: "http://www.talcahuano.cl/",
  },

  // Región del Maule
  {
    region: "Maule",
    comuna: "Curicó",
    facebook: "https://www.facebook.com/municurico",
    instagram: "https://www.instagram.com/muni.curico/",
    sitioWeb: "https://www.curico.cl/home/",
  },
  {
    region: "Maule",
    comuna: "Linares",
    facebook: "https://www.facebook.com/corporacionlinares.cl",
    sitioWeb: "https://www.munilinares.cl/",
    notas: "Sin Instagram activo",
  },
  {
    region: "Maule",
    comuna: "Talca",
    sitioWeb: "https://www.talcatransparente.cl/",
    notas: "Sin Facebook ni Instagram activos",
  },
];

export const total = MUNICIPIOS.length; // 64 municipios con datos
