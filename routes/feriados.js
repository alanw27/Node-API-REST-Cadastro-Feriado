const express = require('express');
const router = express.Router();
const Feriado = require("../models/Feriado");
const anoAtual = "2020-";

router.get("/:codigo_ibge/:data_feriado", (req, res, next) => {
    if(validaDataCompleta(req.params.data_feriado))
    {
        Feriado.findAll({
            attributes: [['nome_feriado', 'name']],
            where: {
                data_feriado: req.params.data_feriado
            }
        }).then((feriados) => {
            if(feriados.length > 0)
            {
                res.status(200).json(feriados);
            }
            else
            {
                res.status(404).json({message: "Feriado não encontrado"});
            }
        }).catch(error => res.status(500).json(error));
    }
    else
    {
        res.status(403).json({message: "Formato de data incorreta"}); 
    }
});

router.put("/:codigo_ibge/:data_feriado", async (req, res, next) => {
    if(!isNaN(req.params.data_feriado.charAt(0)))
    {
        if(validaDataCompleta(anoAtual+req.params.data_feriado))
        { 
            let tipo_feriado = 2;

            if(req.params.codigo_ibge.length > 2)
            {
                tipo_feriado = 3;
            }

            let [feriado, created] = await Feriado.findOrCreate({
                where: { data_feriado: anoAtual+req.params.data_feriado, codigo_ibge: req.params.codigo_ibge },
                defaults: {
                    codigo_ibge:req.params.codigo_ibge,
                    tipo_feriado:tipo_feriado,
                    nome_feriado:req.body.name
                }
            });

            if (created) 
            {
                res.status(201).json(feriado);
            }
            else
            {
                Feriado.update(
                    { nome_feriado: req.body.name },
                    { where: { data_feriado: anoAtual+req.params.data_feriado, codigo_ibge: req.params.codigo_ibge } }
                ) .then(result => res.status(200).json(result)).catch(error => res.status(500).json(error));
            }
        }
        else
        {
            res.status(403).json({message: "Formato de data incorreta"});   
        }
    }
    else
    {
        let nomeFeriado = req.params.data_feriado;
        let dataFeriado = getDataFeriadoMovel(req.params.data_feriado);
        let tipo_feriado = 2;

        if(req.params.codigo_ibge.length > 2)
        {
            tipo_feriado = 3;
        }

        let [feriado, created] = await Feriado.findOrCreate({
            where: { data_feriado: dataFeriado, codigo_ibge: req.params.codigo_ibge },
            defaults: {
                codigo_ibge:req.params.codigo_ibge,
                tipo_feriado:tipo_feriado,
                nome_feriado:nomeFeriado
            }
        });

        if (created) 
        {
            res.status(201).json(feriado);
        }
        else
        {
            Feriado.update(
                { nome_feriado: nomeFeriado },
                { where: { data_feriado: dataFeriado, codigo_ibge: req.params.codigo_ibge } }
            ) .then(result => res.status(200).json(result)).catch(error => res.status(500).json(error));
        }
    }

});

router.delete("/:codigo_ibge/:data_feriado", (req, res, next) => {
    if(!isNaN(req.params.data_feriado.charAt(0)))
    {
        if(validaDataCompleta(anoAtual+req.params.data_feriado))
        { 
            Feriado.findAll({
                attributes: ['tipo_feriado'],
                where: {
                    data_feriado: anoAtual+req.params.data_feriado
                }
            }).then((feriados) => {
                if(feriados.length > 0)
                {
                    deleteFeriado(feriados[0].tipo_feriado, anoAtual+req.params.data_feriado, req.params.codigo_ibge,res);
                }
                else
                {
                    res.status(404).json({message: "Feriado não encontrado"});
                }
            }).catch(error => res.status(500).json({"message": "teste2"}));
        }
        else
        {
            res.status(403).json({message: "Formato de data incorreta1"});  
        }
    }
    else
    {
        let nomeFeriado = req.params.data_feriado;
        let dataFeriado = getDataFeriadoMovel(nomeFeriado);
        Feriado.findAll({
            attributes: ['tipo_feriado'],
            where: {
                data_feriado: dataFeriado
            }
        }).then((feriados) => {
            if(feriados.length > 0)
            {
                deleteFeriado(feriados[0].tipo_feriado, dataFeriado, req.params.codigo_ibge, res);
            }
            else
            {
                res.status(404).json({message: "Feriado não encontrado"});
            }
        }).catch(error => res.status(500).json({"message": "teste2"}));
    }
});
function deleteFeriado(tipo_feriado, data_feriado,codigo_ibge,res )
{
    if(tipo_feriado == 1)
    {
        res.status(403).json({"message": "Nao pode excluir feriado nacional"});
    }
    else if(tipo_feriado == 2 && codigo_ibge.length > 2)
    {
        res.status(403).json({"message": "Não deve ser possível apagar um feriado estadual a partir apartir de um municipio"});
    }
    else
    {
        Feriado.destroy({
            where: { data_feriado: data_feriado, codigo_ibge: codigo_ibge }
        }).then((result) => {
            res.status(204).json({"message": "Deletado com sucesso"});          
        }).catch(error => res.status(500).json({"message": "teste"}));
    }
}
function subtrairDias(data, dias)
{
    return new Date(data.getTime() - (dias * 24 * 60 * 60 * 1000));
}
function somarDias(data, dias)
{
    return new Date(data.getTime() + (dias * 24 * 60 * 60 * 1000));
}
function getDataFeriadoMovel(nomeFeriado) 
{
    ano = 2020;
    X=24;
    Y=5;
    a=ano % 19;
    b=ano % 4;
    c=ano % 7;
    d=(19* a + X) % 30
    e=(2*b + 4 * c + 6 * d + Y) % 7
    soma=d+e

    if (soma > 9) 
    {
        dia=(d+e-9);
        mes=03;
    }
    else 
    {
        dia=(d+e+22);
        mes=02;
    }

    pascoa=new Date(ano,mes,dia).toLocaleDateString();

    if(nomeFeriado == "carnaval")
    {
        return subtrairDias(new Date(ano,mes,dia), 47).toLocaleDateString();
    }
    else if(nomeFeriado == "sexta-feira-santa")
    {
        return subtrairDias(new Date(ano,mes,dia), 2).toLocaleDateString();
    }
    else if(nomeFeriado == "pascoa")
    {
        return pascoa;
    }
    else if(nomeFeriado == "corpus-christi")
    {
        return somarDias(new Date(ano,mes,dia), 60).toLocaleDateString()
    }
}
function validaDataCompleta(dateString) 
{
    var regEx = /^\d{4}-\d{2}-\d{2}$/;
    if(!dateString.match(regEx)) return false;  // Invalid format
    var d = new Date(dateString);
    var dNum = d.getTime();
    if(!dNum && dNum !== 0) return false; // NaN value, Invalid date
    return d.toISOString().slice(0,10) === dateString;
}
module.exports = router;
