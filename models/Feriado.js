const db = require("../database/index");

const Feriado = db.sequelize.define("tb_feriado", {
    data_feriado:{
        type: db.Sequelize.DATE,
    },
    nome_feriado:{
        type: db.Sequelize.STRING
    },
    tipo_feriado:{
        type: db.Sequelize.INTEGER
    },
    codigo_ibge:{
        type: db.Sequelize.INTEGER
    }
});

module.exports = Feriado;