'use strict';
const axios = require("axios");

const saludUf0 = 0.2790;
const saludUf1 = 0.4396;
const saludUf2 = 0.5599;
const dentalUf0 = 0.2790;
const dentalUf1 = 0.4396;
const dentalUf2 = 0.5599;
const inicial = 0;

async function obtenerPlanes() {
  var response ={ message:'lista planes',code:200,planes:[] }
  try { 
    const {data} = await axios("https://dn8mlk7hdujby.cloudfront.net/interview/insurance/policy");
    const company_percentage = (parseInt(data.policy.company_percentage) / 100);
    data.policy.workers.forEach(wks => {
      let polizas = {  
        edad: wks.age,
        hijos: wks.childs,
        costo: inicial.toFixed(4),
        descuento:inicial.toFixed(4),
        copago:inicial.toFixed(4) 
      };
      
      if (wks.age<=65) {
        switch (wks.childs) {
          case 0:
            polizas.costo = saludUf0.toFixed(4);
            if (data.has_denta_care) polizas.costo = (saludUf0+dentalUf0).toFixed(4);
            break;
          case 1:
            polizas.costo = saludUf1.toFixed(4);
            if (data.has_denta_care) polizas.costo = (saludUf1+dentalUf1).toFixed(4);
            break;
          case 2:
            polizas.costo = saludUf2.toFixed(4);
            if (data.has_denta_care) polizas.costo = (saludUf2+dentalUf2).toFixed(4);
            break;
          default:
            if (data.has_denta_care) polizas.costo = (dentalUf2).toFixed(4);
            break;
        }
        polizas.descuento = (polizas.costo * company_percentage).toFixed(4);
        polizas.copago = (polizas.costo - polizas.descuento).toFixed(4);
      } 
      response.planes.push(polizas);
    });

    return response;

  } catch (error) {
    response.code=500;
    response.message=error.message;
    return response;
  }
}

module.exports.handler = async (event, context, callback) => {
  const planes = await obtenerPlanes();
  const response = {
    statusCode: planes.code,headers: {'Access-Control-Allow-Origin': '*'},
    body: JSON.stringify(planes),
  };
  callback(null, response);
};
