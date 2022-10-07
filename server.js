const express = require("express");
const app = express();
const cors = require("cors");
const db = require("./db");
const path = require("path");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const config = require("./config");
const _ = require("lodash");
var http = require("http");
const e = require("express");
const { Op } = require("sequelize");
const { AsyncLocalStorage } = require("async_hooks");
const { map } = require("lodash");
//141.94.77.9
require("dotenv").config();

app.use(express.json());
app.use(cors());

const arrayToObject5 = (arr) => {
  const res = {};
  arr.forEach((obj, key) => {
    res[key + 1] = obj;
  });
  return res;
};

const safeDbRequest = async (lambda, defaultVal = {}) => {
  const e = new Error();
  try {
    const rv = await lambda();
    return rv || defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

const verifyPassword = async (password, password_hash) => {
  const result = await axios.get(
    "http://141.94.77.9/caisse/verify_password.php?password=" +
      password +
      "&" +
      "hashed_password=" +
      password_hash
  );
  return result.data;
};

function prepareImageUrl(url) {
  url = (url || "").split("e?").join("e%cc%81");
  if (url.includes("http")) {
    return url;
  }
  if (!url.includes("public/photos/article")) {
    return "https://menupremium.fr/storage/menu/" + url;
  }
  if (url == "default.png") {
    return "https://menupremium.fr/storage/restaurant/logo/default.png";
  }
}

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    let user = await safeDbRequest(
      () => db.qr_user.findOne({ where: { username: username } }),
      {}
    );
    
    let password_hash = user.password_hash;
    password_hash = password_hash.replace(/^\$2y(.+)$/i, "$2a$1");
    if (user) {
      user = user.dataValues;
      if (await verifyPassword(password, password_hash)) {
        const restaurant = await safeDbRequest(
          () =>
            db.qr_restaurant.findOne({
              where: {
                user_id: user.manager_id,
              },
            }),
          {}
        );

        const token = jwt.sign(
          { userId: user.id, restId: restaurant.dataValues.id },
          config.JWTPRIVATEKEY
        );
        const session = db.qr_login_sessions.create({
          user_id: user.id,
          timestamp: db.sequelize.fn("NOW"),
          token,
          action: "login",
        });

        return res.send({
          token,
          user_id: user.id,
          username: user.username,
          tva: restaurant.dataValues.tva,
          address: restaurant.dataValues.address,
          telephone: restaurant.dataValues.telephone,
        });
      }
      res.status(400).send({ msg: "wrong password" });
    }
  } catch (err) {
   
    res.status(400).send({ msg: "user not found" });
  }
});

app.get("/api/restoreSession", async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.json({ allowed: false });
  }
  const session = await safeDbRequest(
    () =>
      db.qr_login_sessions.findOne({
        where: { token, action: "login" },
      }),
    {}
  );
  if (!session) {
   
    return res.json({ allowed: false });
  }
  const timestamp = session.timestamp;
  const session_after = await safeDbRequest(
    () =>
      db.qr_login_sessions.findAll({
        where: {
          timestamp: { $gte: timestamp },
          action: "login",
        },
      }),
    []
  );
  return res.json({ allowed: session_after.length === 0 });
});
///Login Zcaisse
app.post("/api/initZcaisse", async (req, res) => {
  try {
    const { username, password } = req.body;
    let user = await safeDbRequest(
      () => db.qr_user.findOne({ where: { username } }),
      {}
    );
   
    let password_hash = user.password_hash;
    password_hash = password_hash.replace(/^\$2y(.+)$/i, "$2a$1");
    let data={
      user:{},
      history:[]
    }
    if (await verifyPassword(password, password_hash)){
      data={...data,user:user.dataValues,}
    }else{
      res.status(400).send({ msg: "wrong password" });
    }
    let allHistorique = await safeDbRequest(() => {
      return db.qr_zcaisse_hstorique.findAll({
        where: { user_id: user.id },
      });
    }, []);
    allHistorique=allHistorique.map((historique)=>historique.dataValues)
    data={...data,history:allHistorique}
    res.status(200).send(data)
  } catch (error) {
  
    res.status(400).send({ msg: "user not found" });
  }
});
    //////////////
app.post("/api/init", async (req, res) => {
  try {
    const { username, password } = req.body;
    let user = await safeDbRequest(
      () => db.qr_user.findOne({ where: { username } }),
      {}
    );
   
    let password_hash = user.password_hash;
    password_hash = password_hash.replace(/^\$2y(.+)$/i, "$2a$1");
    if (user) {
      user = user.dataValues;
  
      if (await verifyPassword(password, password_hash)) {
        const users = await safeDbRequest(
          () =>
            db.qr_user.findAll({
              where: {
                manager_id: user.id,
              },
            }),
          {}
        );

        const currInDb = await safeDbRequest(
          () =>
            db.qr_currencies.findOne({
              where: {
                code: user.currency,
              },
            }),
          {}
        );
        let currency = currInDb.html_entity;

        let staff = [];
        users.forEach((user) => staff.push(user.username));

        let clients = await safeDbRequest(
          () =>
            db.qr_client.findAll({
              where: {
                user_id: user.id,
              },
            }),
          {}
        );
        clients = clients
          .map((client) => client.dataValues)
          .filter((el) => el.supprimer != 1);
       

        return res.send({ staff, user_id: user.id, currency, clients });
      }
      res.status(400).send({ msg: "wrong password" });
    }
  } catch (error) {
   
    res.status(400).send({ msg: "user not found" });
  }
});

app.post("/api/getclients", async (req, res) => {
  const { user_id } = req.body;
  let clients = await safeDbRequest(
    () =>
      db.qr_client.findAll({
        where: {
          user_id: user_id,
        },
      }),
    {}
  );
  clients = clients
    .map((client) => client.dataValues)
    .filter((el) => el.supprimer != 1);
  
  res.send({ clients: clients });
});

app.post("/api/createClient", async (req, res) => {
  const { user_id, client } = req.body;
if(client.nom_prenom !=''){
  const clientInDb = await safeDbRequest(() => {
    return db.qr_client.create({
      user_id: user_id,
      ...client,
    });
  }, {})
  res.status(200).send(clientInDb);
}
 

  
});

app.post("/api/getcoupons", async (req, res) => {
  const { user_id,caisse_id } = req.body;
  const lastOuverture = await safeDbRequest(() => {
    return db.qr_historique.findOne({
      where: { caisse_id: caisse_id, type: "open" },
      order: [["date", "DESC"]],
    });
  }, {});
  const coupons = await safeDbRequest(() => {
    return db.qr_coupon.findAll(      
      { where: { user_id: user_id, created_at: {
        [Op.gte]: lastOuverture.dataValues.date,
      },},order: [["id", "DESC"]],}
    );
  }, []);
  console.log({x:coupons[0]})
  
  res.status(200).send(coupons);
});
app.post("/api/updateClient", async (req, res) => {
  const { user_id, client, client_id } = req.body;

  const clientInDb = await safeDbRequest(() => {
    return db.qr_client.update(
      {
        ...client,
      },
      { where: { id: client_id } }
    );
  }, {});

  res.status(200).send(clientInDb);
});


app.post("/api/clotureDatafromto", async (req, res) => {
  const { user_id, caisse_id, From, To } = req.body;
  const Restaurant = await safeDbRequest(() => {
    return db.qr_restaurant.findOne({
      where: { user_id: user_id },
    });
  }, {});

  const lastOuverture = await safeDbRequest(() => {
    return db.qr_historique.findAll({
      where: {
        caisse_id: caisse_id,
        date: {
          [Op.between]: [From, To],
        },
      },
      order: [["id", "DESC"]],
    });
  }, {});
  let myOuverture = lastOuverture; /* .filter(
    (ouv) => ouv.date.toISOString().substr(0, 10) == TODAY
  ); */
  myOuverture = myOuverture.map((e) => e.dataValues);

  let hour = myOuverture[0]?.date.getHours();
  let minute = myOuverture[0]?.date.getMinutes();
  let second = myOuverture[0]?.date.getSeconds();
  var startDate = new Date(From);
  startDate.setHours(hour, minute, second);
 

  let hourend = myOuverture[myOuverture.length - 1]?.date.getHours();
  let minuteend = myOuverture[myOuverture.length - 1]?.date.getMinutes();
  let secondend = myOuverture[myOuverture.length - 1]?.date.getSeconds();
  var endDate = new Date(To);
  endDate.setHours(hourend, minuteend, secondend);
  

  const orders = await safeDbRequest(() => {
    return db.qr_orders.findAll({
      where: { restaurant_id: user_id },
    });
  }, {});
  let tod2 = new Date();

  

  let todayOrders = orders.filter(
    (el) => el.created_at >= startDate && el.created_at <= endDate
  );

  let orderItems = [];
  for (let order of todayOrders) {
    let orderItemsInDb = await safeDbRequest(() => {
      return db.qr_order_items.findAll({
        where: { order_id: order.id },
      });
    }, {});
    orderItemsInDb = orderItemsInDb.map((e) => e.dataValues);
    orderItems.push(...orderItemsInDb);
  }

  orderItems = orderItems.map((item) => {
    let tvaq = (item.price * ((item.tva / item.price) * 100)) / 100;
    return {
      item_id: item.item_id,
      price: item.price,
      quantity: item.quantity,
      tva: tvaq,
      tva_perc: item.tva,
    };
  });

  orderItems = [
    ...orderItems
      .reduce((r, o) => {
        const key = o.item_id;
        const item =
          r.get(key) ||
          Object.assign({}, o, {
            quantity: 0,
            totalPrice: 0,
          });
        item.quantity += 1;
        item.totalPrice += o.price;
        return r.set(key, item);
      }, new Map())
      .values(),
  ];
  let tvas = _.groupBy(todayOrders, function (b) {
    let tva_perc = b.tva;
    return tva_perc;
  });
  /* Ò */

  Object.keys(tvas).forEach(
    (key) =>
      (tvas[key] = tvas[key].reduce(
        (acc, curr) => acc + (curr.price * curr.tva) / 100,
        0
      ))
  );
  /*   orderItems.forEach((element) => {
    
  }); */

 

  let clients = await safeDbRequest(
    () =>
      db.qr_client.findAll({
        where: {
          user_id: user_id,
        },
      }),
    {}
  );
  clients = clients
    .map((client) => client.dataValues)
    .filter((el) => el.supprimer != 1);
  let groups = _.groupBy(todayOrders, function (b) {
    return b.pay_method;
  });
  let clientGroups = _.groupBy(todayOrders, function (b) {
    return b.customer_id;
  });

  let logs = await safeDbRequest(
    () =>
      db.qr_log.findAll({
        where: {
          id_rest: user_id,
          time_log: {
            [Op.gte]: startDate,
          },
        },
      }),
    null
  );
  logs = logs.map((e) => e.dataValues);
  

  let today = {
    tvas,
    orderItems,
    groups,
    clientGroups,
    nbr: todayOrders.length,
    clients: clients.length,
    total: todayOrders.reduce((acc, curr) => acc + curr.price, 0),
    tva: todayOrders.reduce((acc, curr) => acc + curr.tva, 0),
    logs,
  };

  let chiffre = orders.reduce((acc, curr) => acc + (curr.price + curr.tva), 0);
  let commandesTotal = orders.length;

  res.status(200).send({
    Restaurant,
    lastOuverture: myOuverture[0],
    today,
    chiffre,
    commandesTotal,
  });
});

app.post("/api/clotureData", async (req, res) => {
  const { user_id, caisse_id, TODAY } = req.body;
  const Restaurant = await safeDbRequest(() => {
    return db.qr_restaurant.findOne({
      where: { user_id: user_id },
    });
  }, {});

  const lastOuverture = await safeDbRequest(() => {
    return db.qr_historique.findAll({
      where: { caisse_id: caisse_id, type: "open" },
      order: [["id", "DESC"]],
    });
  }, {});
  let myOuverture = lastOuverture.filter(
    (ouv) => ouv.date.toISOString().substr(0, 10) == TODAY
  );
  myOuverture = myOuverture.map((e) => e.dataValues);
 
  let hour = myOuverture[0]?.date.getHours();
  let minute = myOuverture[0]?.date.getMinutes();
  let second = myOuverture[0]?.date.getSeconds();
  var startDate = new Date();
  startDate.setHours(hour, minute, second);
 
  const orders = await safeDbRequest(() => {
    return db.qr_orders.findAll({
      where: { restaurant_id: user_id ,status:"completed"},
    });
  }, {});
  let tod2 = new Date();


  

  let todayOrders = orders.filter((el) => el.created_at >= startDate);

  let orderItems = [];
  for (let order of todayOrders) {
    let orderItemsInDb = await safeDbRequest(() => {
      return db.qr_order_items.findAll({
        where: { order_id: order.id },
      });
    }, {});
    orderItemsInDb = orderItemsInDb.map((e) => e.dataValues);
    orderItems.push(...orderItemsInDb);
  }

  orderItems = orderItems.map((item) => {
    let tvaq = (item.price * ((item.tva / item.price) * 100)) / 100;
    return {
      item_id: item.item_id,
      price: item.price,
      quantity: item.quantity,
      tva: tvaq,
      tva_perc: item.tva,
    };
  });

  orderItems = [
    ...orderItems
      .reduce((r, o) => {
        const key = o.item_id;
        const item =
          r.get(key) ||
          Object.assign({}, o, {
            quantity: 0,
            totalPrice: 0,
          });
        item.quantity += 1;
        item.totalPrice += o.price;
        return r.set(key, item);
      }, new Map())
      .values(),
  ];
  let tvas = _.groupBy(todayOrders, function (b) {
    let tva_perc = b.tva;
    return tva_perc;
  });
  /* Ò */

  Object.keys(tvas).forEach(
    (key) =>
      (tvas[key] = Number(tvas[key].reduce(
        (acc, curr) => acc + (curr.price/(1+curr.tva/100)) * curr.tva / 100,
        0
      ).toFixed(2)) )
  );
  /*   orderItems.forEach((element) => {
   
  }); */

  

  let clients = await safeDbRequest(
    () =>
      db.qr_client.findAll({
        where: {
          user_id: user_id,
        },
      }),
    {}
  );
  clients = clients
    .map((client) => client.dataValues)
    .filter((el) => el.supprimer != 1);
  let groups = _.groupBy(todayOrders, function (b) {
    return b.pay_method;
  });
  let clientGroups = _.groupBy(todayOrders, function (b) {
    return b.customer_id;
  });

  let logs = await safeDbRequest(
    () =>
      db.qr_log.findAll({
        where: {
          id_rest: user_id,
          time_log: {
            [Op.gte]: startDate,
          },
        },
      }),
    null
  );
  logs = logs.map((e) => e.dataValues);
 

  let today = {
    tvas,
    orderItems,
    groups,
    clientGroups,
    nbr: todayOrders.length,
    clients: clients.length,
    total: todayOrders.reduce((acc, curr) => acc + curr.price, 0),
    tva: todayOrders.reduce((acc, curr) => acc + curr.tva, 0),
    logs,
  };

  let chiffre = orders.reduce((acc, curr) => acc + (curr.price + curr.tva), 0);
  let commandesTotal = orders.length;

  res.status(200).send({
    Restaurant,
    lastOuverture: myOuverture[0],
    today,
    chiffre,
    commandesTotal,
  });
});

app.post("/api/printzcaisse", async (req, res) => {
  const { PrintData, user_id } = req.body;

  let bornfromDb = await safeDbRequest(() => {
    return db.qr_borne.findOne({
      where: { rest_id: user_id },
    });
  }, {});
  const restInDb = await safeDbRequest(
    () => db.qr_restaurant.findOne({ where: { user_id: user_id } }),
    {}
  );
  let forward = {
    ...PrintData,
    ip_printer: restInDb.dataValues.ip_printer,
    link:restInDb.dataValues.dynamic_ngrok_link
  };

  let axiosConfig = {
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
    },
  };
  
 

  const zcaisse = await safeDbRequest(
    () =>
      axios.post(forward.link+"/zcaisse.php", forward, axiosConfig),
    {}
  );

  res.sendStatus(200);
});
app.post("/api/historiqueZcaisse" ,async(req,res)=>{
  const { PrintData, user_id } = req.body;
  
  
  try {
    let bornfromDb = await safeDbRequest(() => {
      return db.qr_borne.findOne({
        where: { rest_id: user_id },
      });
    }, {});
    let historyCaisse = await safeDbRequest(()=>{
      return db.qr_zcaisse_hstorique.create({
        user_id:user_id,
        data:PrintData

      })
    })
    res.sendStatus(200);
  } catch (error) {
    console.log(error)
  }
  
 
})
app.post("/api/getHistoriqueZcaisse",async(req,res)=>{
  const { user_id } = req.body;
try {
  let allHistorique = await safeDbRequest(() => {
    return db.qr_zcaisse_hstorique.findAll({
      where: { user_id: user_id },
    });
  }, {});
  
  res.status(200).send({ allHistorique});
} catch (error) {
  console.log(error)
}
})

app.post("/api/deleteClient", async (req, res) => {
  const { user_id, client, client_id } = req.body;

  const clientInDb = await safeDbRequest(() => {
    return db.qr_client.update(
      {
        supprimer: 1,
      },
      { where: { id: client_id } }
    );
  }, {});

  res.status(200).send(clientInDb);
});

app.post("/api/getUserZones", async (req, res) => {
  const { user_id } = req.body;
  let totalTables = [];
  try {
    let zones = await safeDbRequest(
      () =>
        db.qr_zone.findAll({
          where: {
            user_id: user_id,
          },
        }),
      []
    );
    if (zones) {
      for (let zone of zones) {
        let tables = await safeDbRequest(
          () =>
            db.qr_table.findAll({
              where: {
                zone_id: zone.id,
              },
            }),
          
        );
        if (tables) {
          totalTables = [...totalTables, ...tables];
        }
      }

      res.status(200).send({ zones, tables: totalTables });
    }
    res.status(400).send({ msg: "no zones found" });
  } catch (e) {
    console.log(e);
  }
});

app.post(`/api/categories`, async (req, res) => {
  const { user_id } = req.body;
  try {
    let categories = await safeDbRequest(
      () =>
        db.qr_catagory_main.findAll({
          where: {
            user_id: user_id,
          },
        }),
      []
    );
    if (categories) {
      categories = categories.map((e) => ({
        name: e.dataValues.cat_name,
        picture: prepareImageUrl(e.dataValues.picture),
        id: e.dataValues.cat_id,
        color: e.dataValues.color,
        cat_order: e.dataValues.cat_order,
        state: e.dataValues.state,
      }));
      res.send(categories);
    }
  } catch (err) {
    res.status(400).send({ msg: err });
  }
});

app.post(`/api/products`, async (req, res) => {
  const { user_id } = req.body;
  //Load compositions
  let compositions = [];
  let tvas = [];
  try {
    compositions = await safeDbRequest(
      () =>
        db.qr_composition_main.findAll({
          where: {
            user_id: user_id,
          },
        }),
      []
    );
    tvas = await safeDbRequest(
      () =>
        db.qr_tva.findAll({
          where: {
            user_id: user_id,
          },
        }),
      []
    );

    tvas = tvas.map((e) => e.dataValues);
   
    compositions = compositions.map((e) => e.dataValues);

    compositions = compositions.map((e) => ({
      cat_id: e.cat_id,
      id: e.id,
      name: e.name,
      price: e.price,
      tva: tvas.filter((el) => el.id == e.tva)[0].tva,
      image: prepareImageUrl(e.image),
      description: e.description,
      isComp: true,
      active: e.active,
      is_hot: 1,
      is_cold: 0,
      code:e.code,
      
      
    }));
    for (let compKey in compositions) {
      let comp = compositions[compKey];
      let links = await safeDbRequest(
        () =>
          db.qr_product_composition_link.findAll({
            where: { comp_id: comp.id },
          }),
        []
      );
      if (links) {
        for (let linkKey in links) {
          let l = links[linkKey];
          let product = await safeDbRequest(
            () =>
              db.qr_menu.findAll({
                where: { id: l.dataValues.prod_id },
              }),
            []
          );
          let link = {
            id: l.dataValues.id,
            prod_id: l.dataValues.prod_id,
            name: product[0].name,
            price: product[0].price,
            image: prepareImageUrl(product[0].image),
            description: product[0].description,
            slot: l.dataValues.slot,
            checked: false,
          };
          links[linkKey] = link;
        }
      }
      // get compositions slots ids
      const slots_ids = links
        .map((l) => l.slot)
        .filter((x, i, a) => a.indexOf(x) === i)
        .flat();
      let slots = [];
      for (let slot_id of slots_ids) {
        let slot = await safeDbRequest(() =>
          db.qr_composition_slot.findOne({
            where: { id: slot_id },
          })
        );
        slot = slot.dataValues;
        slots = [...slots, slot];
      }
      compositions[compKey].slots = {};
      links = _.groupBy(links, "slot");
      for (let slot of slots) {
        let slot_products = links[slot.id];
        for (let i = 0; i < slot.max_select; ++i) {
          slot_products[i].checked = true;
        }
        slot = { ...slot, products: slot_products };
        compositions[compKey].slots[slot.slot_name] = slot;
      }
    }
  } catch (e) {
    compositions = [];
  }
  // Load products
  let products = [];
  if (true) {
    products = (
      await safeDbRequest(
        () =>
          db.qr_menu.findAll({
            where: {
              user_id: user_id,
            },
          }),
        []
      )
    ).map((e) => e.dataValues);

    products = products.map((p) => ({
      cat_id: p.cat_id,
      id: p.id,
      name: p.name,
      price: p.price,

      is_alcool: p.is_alcool,
      image: prepareImageUrl(p.image),
      description: p.description,
      isComp: false,
      nsteps: p.nsteps,
      position: p.postion,
      active: p.active,
      is_hot: p.is_hot,
      is_cold: p.is_cold,
      code:p.code,
      is_supp:p.is_supp,
      supplement:{
        sauces:[],
        drinks:[]
      }
    }));

    for (let productKey in products) {
      let product = products[productKey];

      if(products[productKey].is_supp){
        let sauces = await safeDbRequest(()=>
         db.qr_menu_sauce.findAll({
          where:{user_id:user_id}
         })
        );
     sauces=    sauces.map(e=>e.dataValues)
        products[productKey].supplement.sauces= sauces

        let drinks = await safeDbRequest(()=>
        db.qr_menu.findAll({
         where:{is_cold:true,user_id:user_id}
        })
       );
       drinks=    drinks.map(e=>e.dataValues)
       products[productKey].supplement.drinks= drinks
      }
      let extras = await safeDbRequest(
        () =>
          db.qr_menu_extras.findAll({
            where: { menu_id: product.id },
          }),
        []
      );
      if (extras) {
        extras = extras.map((e) => {
          return {
            id: e.dataValues.id,
            menu_id: e.dataValues.menu_id,
            title: e.dataValues.title,
            price: parseInt(e.dataValues.price),
            default_quantity: e.dataValues.default_quantity,
            min_quantity: e.dataValues.min_quantity,
            max_quantity: e.dataValues.min_quantity,
          };
        });
      }
      products[productKey].extras = extras;
    }
  }
  let menuSteps = [];
  menuSteps = await safeDbRequest(
    () =>
      db.qr_menu_steps.findAll({
        where: {
          user_id: user_id,
        },
      }),
    []
  );

  if (menuSteps) {
    menuSteps = menuSteps.map((e) => ({
      id: e.dataValues.id,
      menu_id: e.dataValues.menu_id,
      user_id: e.dataValues.user_id,
      ...arrayToObject5(e.dataValues.steps),
    }));
  }

  res.send({
    products: [...products, ...compositions],
    menuSteps: [...menuSteps],
  });
});
app.post("/api/bringwarehouse", async (req, res) => {
  let { prod_id } = req.body;
  const updatedProduct = await safeDbRequest(() => {
    return db.qr_menu.update(
      {
        active: "1"
      },
      { where: { id: prod_id } }
    );
  }, {});

  res.status(200).send(updatedProduct);
});

app.post("/api/resetwarehouse", async (req, res) => {
  let { prod_id } = req.body;
  const updatedProduct = await safeDbRequest(() => {
    return db.qr_menu.update(
      {
        active: "0"
      },
      { where: { id: prod_id } }
    );
  }, {});

  res.status(200).send(updatedProduct);
});

app.post(`/api/getCaisse`, async (req, res) => {
  const { user_id } = req.body;
  try {
    let caisse = await safeDbRequest(
      () =>
        db.qr_caisse.findOne({
          where: {
            user_id: user_id}
        }),
      []
    );
    if (caisse) {
      caisse = caisse.dataValues;
      res.send(caisse);
    }
  } catch (err) {
    res.status(400).send({ msg: err });
  }
});

app.post("/api/gettva", async (req, res) => {
  try {
    let tva_modes = await safeDbRequest(() => db.qr_tva_mode.findAll(), []);
    if (tva_modes) {
     
      res.send(tva_modes);
    }
  } catch (err) {
    res.status(400).send({ msg: err });
  }
});
// app.post("/api/getpaymethod", async (req, res) => {
//   const pay_methods = await safeDbRequest(() => db.qr_pay_method.findAll(), {});
//   res.send(pay_methods);
// });

//get all orders
app.post("/api/getallorders", async (req, res) => {
  const { user_id, caisse_id, customer_id } = req.body;
  var myOrders = [];
  const lastOuverture = await safeDbRequest(() => {
    return db.qr_historique.findOne({
      where: { caisse_id: caisse_id, type: "open" },
      order: [["date", "DESC"]],
    });
  }, {});
 

  const ordersInDb = await safeDbRequest(
    () =>
      db.qr_orders.findAll({
        where: {
          restaurant_id: user_id,
          customer_id: customer_id,
        },
      }),
    {}
  );

  myOrders = await ordersInDb.map((e) => e.dataValues);
  var toSend = [];
  for (let order of myOrders) {
    order = { ...order, orderItems: [] };
    let paymentsInDb = await safeDbRequest(
      () =>
        db.qr_payment.findAll({
          where: { order_id: order.id },
        }),
      []
    );
    paymentsInDb = paymentsInDb.map((e) => e.dataValues);

    let orderItemsInDb = await safeDbRequest(
      () =>
        db.qr_order_items.findAll({
          where: { order_id: order.id },
        }),
      {}
    );
    orderItemsInDb = orderItemsInDb.map((e) => e.dataValues);
    for (let item of orderItemsInDb) {
      if (item.is_comp) {
        var itemInDb = await safeDbRequest(
          () =>
            db.qr_composition_main.findOne({
              where: { id: item.item_id },
            }),
          {}
        );
      } else {
        var itemInDb = await safeDbRequest(
          () =>
            db.qr_menu.findOne({
              where: { id: item.item_id },
            }),
          {}
        );
      }
      itemInDb = itemInDb.dataValues;
      itemInDb = {
        ...itemInDb,
        qt: itemInDb.quantity,
        slots: [],
        extras: [],
        steps: [],
      };
    
      ////slots///
      let slots = await safeDbRequest(
        () =>
          db.qr_order_item_composition.findAll({
            where: { order_item_id: item.id },
          }),
        {}
      );
      slots = slots.map((e) => e.dataValues);
      for (let slot of slots) {
        let slotInDb = await safeDbRequest(
          () =>
            db.qr_menu.findOne({
              where: { id: slot.product_id },
            }),
          {}
        );
        slotInDb = slotInDb.dataValues;
        itemInDb["slots"].push({
          ...slotInDb,
          price: slot.price,
          quantity: slot.quantity,
        });
      }

      //////extra/////
      let extras = await safeDbRequest(
        () =>
          db.qr_order_item_extras.findAll({
            where: { order_item_id: item.id },
          }),
        {}
      );
      extras = extras.map((e) => e.dataValues);
      for (let extra of extras) {
        let extraInDb = await safeDbRequest(
          () =>
            db.qr_menu_extras.findOne({
              where: { id: extra.extra_id },
            }),
          {}
        );
        extraInDb = extraInDb.dataValues;
        itemInDb["extras"].push({
          ...extraInDb,
          price: extra.price,
          default_quantity: extra.quantity,
        });

       
      }
      //////steps/////
      let steps = await safeDbRequest(
        () =>
          db.qr_order_item_steps.findAll({
            where: { order_item_id: item.id },
          }),
        {}
      );
      steps = steps.map((e) => e.dataValues);
      for (let step of steps) {
        let stepInDb = await safeDbRequest(
          () =>
            db.qr_menu.findOne({
              where: { id: step.item_id },
            }),
          {}
        );
        stepInDb = stepInDb.dataValues;
        itemInDb["steps"].push({
          ...stepInDb,
          price: step.price,
          quantity: step.quantity,
        });

      
      }

     
      await order["orderItems"].push({
        ...itemInDb,
        quantity: item.quantity,
        tva: item.tva,
        price: item.price,
        is_comp: item.is_comp,
        from_kiosk: item.from_kiosk,
      });
    }

    toSend.push({ ...order, paymentsInDb });
  }
  res.send(toSend);
});
app.post("/api/getorder", async (req, res) => {
  const { user_id, order_id } = req.body;

  const orderInDb = await safeDbRequest(
    () =>
      db.qr_orders.findOne({
        where: {
          restaurant_id: user_id,
          id: parseInt(order_id),
        },
      }),
    {}
  );
  if (orderInDb.dataValues == undefined) {
    res.send("no data");
  } else {
    var toSend = [];

    order = { ...orderInDb.dataValues, orderItems: [] };
    let paymentsInDb = await safeDbRequest(
      () =>
        db.qr_payment.findAll({
          where: { order_id: order.id },
        }),
      []
    );
    paymentsInDb = paymentsInDb?.map((e) => e.dataValues);

    let orderItemsInDb = await safeDbRequest(
      () =>
        db.qr_order_items.findAll({
          where: { order_id: order.id },
        }),
      {}
    );
    orderItemsInDb = orderItemsInDb.map((e) => e.dataValues);
    for (let item of orderItemsInDb) {
      if (item.is_comp) {
        var itemInDb = await safeDbRequest(
          () =>
            db.qr_composition_main.findOne({
              where: { id: item.item_id },
            }),
          {}
        );
      } else {
        var itemInDb = await safeDbRequest(
          () =>
            db.qr_menu.findOne({
              where: { id: item.item_id },
            }),
          {}
        );
      }
      itemInDb = itemInDb.dataValues;
      itemInDb = {
        ...itemInDb,
        qt: itemInDb.quantity,
        slots: [],
        extras: [],
        steps: [],
      };
   
      ////slots///
      let slots = await safeDbRequest(
        () =>
          db.qr_order_item_composition.findAll({
            where: { order_item_id: item.id },
          }),
        {}
      );
      slots = slots.map((e) => e.dataValues);
      for (let slot of slots) {
        let slotInDb = await safeDbRequest(
          () =>
            db.qr_menu.findOne({
              where: { id: slot.product_id },
            }),
          {}
        );
        slotInDb = slotInDb.dataValues;
        itemInDb["slots"].push({
          ...slotInDb,
          price: slot.price,
          quantity: slot.quantity,
        });
      }

      //////extra/////
      let extras = await safeDbRequest(
        () =>
          db.qr_order_item_extras.findAll({
            where: { order_item_id: item.id },
          }),
        {}
      );
      extras = extras.map((e) => e.dataValues);
      for (let extra of extras) {
        let extraInDb = await safeDbRequest(
          () =>
            db.qr_menu_extras.findOne({
              where: { id: extra.extra_id },
            }),
          {}
        );
        extraInDb = extraInDb.dataValues;
        itemInDb["extras"].push({
          ...extraInDb,
          price: extra.price,
          default_quantity: extra.quantity,
        });

      
      }
      //////steps/////
      let steps = await safeDbRequest(
        () =>
          db.qr_order_item_steps.findAll({
            where: { order_item_id: item.id },
          }),
        {}
      );
      steps = steps.map((e) => e.dataValues);
      for (let step of steps) {
        let stepInDb = await safeDbRequest(
          () =>
            db.qr_menu.findOne({
              where: { id: step.item_id },
            }),
          {}
        );
        stepInDb = stepInDb.dataValues;
        itemInDb["steps"].push({
          ...stepInDb,
          price: step.price,
          quantity: step.quantity,
        });

       
      }

     
      await order["orderItems"].push({
        ...itemInDb,
        quantity: item.quantity,
        tva: item.tva,
        price: item.price,
        is_comp: item.is_comp,
        from_kiosk: item.from_kiosk,
      });
    }

    toSend.push({ ...order, paymentsInDb });

    res.send(toSend);
  }
});
app.post("/api/getorders", async (req, res) => {
  const { user_id, caisse_id } = req.body;
  var myOrders = [];
  const lastOuverture = await safeDbRequest(() => {
    return db.qr_historique.findOne({
      where: { caisse_id: caisse_id, type: "open" },
      order: [["date", "DESC"]],
    });
  }, {});
  

  const ordersInDb = await safeDbRequest(
    () =>
      db.qr_orders.findAll({
        where: {
          restaurant_id: user_id,
          created_at: {
            [Op.gte]: lastOuverture.dataValues.date,
          },
        },
      }),
    {}
  );

  myOrders = await ordersInDb.map((e) => e.dataValues);
  var toSend = [];
  for (let order of myOrders) {
    order = { ...order, orderItems: [] };
    let paymentsInDb = await safeDbRequest(
      () =>
        db.qr_payment.findAll({
          where: { order_id: order.id },
        }),
      []
    );
    paymentsInDb = paymentsInDb.map((e) => e.dataValues);

    let orderItemsInDb = await safeDbRequest(
      () =>
        db.qr_order_items.findAll({
          where: { order_id: order.id },
        }),
      {}
    );
    orderItemsInDb = orderItemsInDb.map((e) => e.dataValues);
    for (let item of orderItemsInDb) {
      if (item.is_comp) {
        var itemInDb = await safeDbRequest(
          () =>
            db.qr_composition_main.findOne({
              where: { id: item.item_id },
            }),
          {}
        );
      } else {
        var itemInDb = await safeDbRequest(
          () =>
            db.qr_menu.findOne({
              where: { id: item.item_id },
            }),
          {}
        );
      }
      itemInDb = itemInDb.dataValues;
      itemInDb = {
        ...itemInDb,
        qt: itemInDb.quantity,
        slots: [],
        extras: [],
        steps: [],
        suppSelected:[]
      };
      // suplements////
      let suppSelected=[]
      let drinkID = await safeDbRequest(
        ()=>
        db.qr_items_supp.findAll({
          where:{order_item_id:item.id}
        }),
        {}
      )
      drinkID = drinkID.map((e) => e.dataValues.drink_id);
      let drink = await safeDbRequest(
        ()=>
        db.qr_menu.findAll({
          where:{id:drinkID[0]}
        }),
        []
      )
      if(drink.length>0){
        drink =drink.map(e=>e.dataValues)
        suppSelected =[...suppSelected,drink[0]]
      }
    
      let saucesIds = await safeDbRequest(
        ()=> db.qr_item_sauce.findAll({
          where:{items_id:item.id}
        }),
        {}
      )
      saucesIds = saucesIds.map((e) => e.dataValues.sauce_id);
      for(let sauceId of saucesIds){
        let sauce = await safeDbRequest(
          ()=>
          db.qr_menu_sauce.findAll({
            where:{id:sauceId}
          }),
          {}
        )
        sauce =sauce.map(e=>e.dataValues)
        suppSelected =[...suppSelected,sauce[0]]

      }
      itemInDb["suppSelected"]=[...suppSelected]
       
 
 
      ////slots///
      let slots = await safeDbRequest(
        () =>
          db.qr_order_item_composition.findAll({
            where: { order_item_id: item.id },
          }),
        {}
      );
      slots = slots.map((e) => e.dataValues);
      for (let slot of slots) {
        let slotInDb = await safeDbRequest(
          () =>
            db.qr_menu.findOne({
              where: { id: slot.product_id },
            }),
          {}
        );
        slotInDb = slotInDb.dataValues;
        itemInDb["slots"].push({
          ...slotInDb,
          price: slot.price,
          quantity: slot.quantity,
        });
      }

      //////extra/////
      let extras = await safeDbRequest(
        () =>
          db.qr_order_item_extras.findAll({
            where: { order_item_id: item.id },
          }),
        {}
      );
      extras = extras.map((e) => e.dataValues);
      for (let extra of extras) {
        let extraInDb = await safeDbRequest(
          () =>
            db.qr_menu_extras.findOne({
              where: { id: extra.extra_id },
            }),
          {}
        );
        extraInDb = extraInDb.dataValues;
        itemInDb["extras"].push({
          ...extraInDb,
          price: extra.price,
          default_quantity: extra.quantity,
        });

        
      }
      //////steps/////
      let steps = await safeDbRequest(
        () =>
          db.qr_order_item_steps.findAll({
            where: { order_item_id: item.id },
          }),
        {}
      );
      steps = steps.map((e) => e.dataValues);
      for (let step of steps) {
        let stepInDb = await safeDbRequest(
          () =>
            db.qr_menu.findOne({
              where: { id: step.item_id },
            }),
          {}
        );
        stepInDb = stepInDb.dataValues;
        itemInDb["steps"].push({
          ...stepInDb,
          price: step.price,
          quantity: step.quantity,
        });

     
      }

      await order["orderItems"].push({
        ...itemInDb,
        quantity: item.quantity,
        tva: item.tva,
        price: item.price,
        is_comp: item.is_comp,
        from_kiosk: item.from_kiosk,
      });
    }

    toSend.push({ ...order, paymentsInDb });
  }
  res.send(toSend);
});
// annuler

app.post("/api/cancelorder",async(req,res)=>{
   const {order}= req.body;
   const orderInDb = await safeDbRequest(() => {
    return db.qr_orders.update(
      {
        status:"rejected"
      },
      { where: { id: order.order_id } }
    );
    
  
    
  }, {});
  
  if (orderInDb) {
    const UpdatedTable = await safeDbRequest(
      () =>
        db.qr_table.update(
          { libre: true },
          { where: { id: order.table_number } }
        ),
      {}
    );
  }
  res.send(orderInDb)

})
app.post("/api/updateorder", async (req, res) => {
  const { order } = req.body;
  
  const orderInDb = await safeDbRequest(() => {
    return db.qr_orders.update(
      {
        price: order.totalPrice,
        tva: order.taxPrice,
      },
      { where: { id: order.id } }
    );
  }, {});

  const items = order.orderItems;
  for (let item of items) {
    const itemdestoryed = await safeDbRequest(
      () =>
        db.qr_order_items.destroy({
          where: {
            order_id: order.id,
            item_id: item.id,
            price: item.price,
            is_comp: item.isComp,
            from_kiosk: 0,
          },
        }),
      {}
    );
    const itemInDb = await safeDbRequest(
      () =>
        db.qr_order_items.create({
          order_id: order.id,
          note: item.note || "",
          item_id: item.id,
          price: item.price,
          tva: (item.price * item.tva) / 100,
          is_hot: item.is_hot,
          is_comp: item.isComp,
          is_cold: item.is_cold,
          from_kiosk: 0,
          quantity:item.qt
        }),
        // db.qr_order_items.create({
        //   note: item.note || "",
        //   order_id: orderInDb.dataValues.id,
        //   item_id: item.id,
        //   price: item.price,
        //   tva: (item.price * item.tva) / 100,
        //   is_comp: item.isComp,
        //   is_hot: item.is_hot,
        //   is_cold: item.is_cold,
        //   from_kiosk: 0,
        //   quantity:item.qt
        // }),
      {}
    );
    if (item.slots) {
      for (let slotKey in item.slots) {
        let slot = item.slots[slotKey];
        for (let product of slot.products) {
          if (product.checked) {
            const compInDb = await safeDbRequest(
              () =>
                db.qr_order_item_composition.create({
                  order_item_id: itemInDb.dataValues.id,
                  slot_id: slot.id,
                  product_id: product.prod_id,
                  price: product.price,
                  quantity: 1,
                }),
              {}
            );
          }
        }
      }
    }
    for (let extra_ of item.extras || []) {
      if (extra_.default_quantity > 0) {
        const extraInDb = await safeDbRequest(
          () =>
            db.qr_order_item_extras.create({
              order_item_id: itemInDb.dataValues.id,
              extra_id: extra_.id,
              quantity: extra_.default_quantity,
              price: extra_.price,
            }),
          {}
        );
      }
    }
    if (item.nsteps > 0) {
      for (let steps of Object.keys(item.stepItems) || []) {
        for (let step of item.stepItems[steps]) {
         
          const stepInDb = await safeDbRequest(
            () =>
              db.qr_order_item_steps.create({
                order_item_id: itemInDb.dataValues.id,
                item_id: step.id,
                quantity: 1,
                price: step.price,
              }),
            {}
          );
        }
      }
    }
  }
  res.send(orderInDb);
});
//////////////////////////////////////
app.post("/api/updateNgerokLink", async (req, res) => {
  const { user_id, link } = req.body;

  const resturanInDb = await safeDbRequest(() => {
    return db.qr_restaurant.update(
      { dynamic_ngrok_link: link },
      { where: { user_id: user_id } }
    );
  }, {});
  res.status(200).send(resturanInDb);
});
///////////////////////////
app.post(`/api/orders`, async (req, res) => {
  const { order, user_id, client, how_paid } = req.body;

  var dateObj = new Date();
  var month = dateObj.getMonth() + 1; //months from 1-12
  var day = dateObj.getDate();
  var year = dateObj.getFullYear();
  today = day + "/" + month + "/" + year;
  if(client.phone != undefined) {
    const clientInDb = await safeDbRequest(() => {
      return db.qr_client.create({
        nom_prenom: client.customer_name,
        societe: client.company || "",
        code_1: client.code1 || "",
        code_2: client.code2 || "",
        etage: client.etage || 0,
        interphone: client.interphone || 0,
        telephone: client.phone,
        adresse: client.address || "",
        code_postal: client.post || 0,
        ville: client.city || "",
        email: client.email || "",
        user_id: user_id,
        supprimer: 0,
      });
    }, {});
  }
  

 
  let clientExist = await safeDbRequest(
    () => db.qr_client.findOne({ where: { id: order.client_id } }),
    {}
  );
  var tva = 0;
  var is_alcool = false;
  let test = order.orderItems;
  order.orderItems.forEach((element) => {
    if (element.tva == 20) {
      is_alcool = true;
    }
  });
  if (is_alcool == true) {
    tva = 20;
  } else {
    switch (order.orderType) {
      case "sur place":
        tva = 10;
        break;
      case "emporter":
        tva = 5.5;
        break;
      case "livraison":
        tva = 5.5;
        break;
      default:
        tva = 10;
        break;
    }
  }

  const orderInDb = await safeDbRequest(() => {
    return db.qr_orders.create({
      source: 2,
      customer_id: order.client_id || 0,
      message: order.message || "",
      restaurant_id: user_id,
      customer_name: order.customer_name || "",
      table_number: order.table_number,
      customer_tel: order.customer_tel || "",
      customer_company: order.customer_company || "",
      code1: order.code1 || "",
      code2: order.code2 || "",
      interphone: order.interphone || "",
      etage: order.etage || "",
      customer_adress: order.customer_adress || "",
      status: "pending",
      seen: 0,
      how_paid: how_paid,
      order_type: order.orderType,
      pay_method: order.paymentType,
      created_at: db.sequelize.fn("NOW"),
      price: order.totalPrice,
      from_kiosk: 0,
      tva: tva,
      date: order.date,
      time: order.time,
      server:order.server
    });
  }, {});

  const UpdatedTable = await safeDbRequest(
    () =>
      db.qr_table.update(
        { libre: false },
        { where: { id: order.table_number } }
      ),
    {}
  );

  const items = order.orderItems;
  for (let item of items) {
   
    const itemInDb = await safeDbRequest(
      () =>
        db.qr_order_items.create({
          note: item.note || "",
          order_id: orderInDb.dataValues.id,
          item_id: item.id,
          price: item.price,
          tva: (item.price * item.tva) / 100,
          is_comp: item.isComp,
          is_hot: item.is_hot,
          is_cold: item.is_cold,
          from_kiosk: 0,
          quantity:item.qt
        }),
      {}
    );
    if (item.slots) {
      for (let slotKey in item.slots) {
        let slot = item.slots[slotKey];
        for (let product of slot.products) {
          if (product.checked) {
            const compInDb = await safeDbRequest(
              () =>
                db.qr_order_item_composition.create({
                  order_item_id: itemInDb.dataValues.id,
                  slot_id: slot.id,
                  product_id: product.prod_id,
                  price: product.price,
                  is_hot: product.is_hot,
                  is_cold: product.is_cold,
                  quantity:item.qt
                }),
              {}
            );
          }
        }
      }
    }
    for (let extra_ of item.extras || []) {
      if (extra_.default_quantity > 0) {
        const extraInDb = await safeDbRequest(
          () =>
            db.qr_order_item_extras.create({
              order_item_id: itemInDb.dataValues.id,
              extra_id: extra_.id,
              quantity: extra_.default_quantity,
              price: extra_.price,
            }),
          {}
        );
      }
    }
    if (item.nsteps > 0) {
      for (let steps of Object.keys(item.stepItems) || []) {
        for (let step of item.stepItems[steps]) {
         
          const stepInDb = await safeDbRequest(
            () =>
              db.qr_order_item_steps.create({
                order_item_id: itemInDb.dataValues.id,
                item_id: step.id,
                quantity:item.qt,
                price: step.price,
                tva: (step.price * step.tva) / 100,
              }),
            {}
          );
        }
      }
    }
    if(item.is_supp){
      const suppInDb = await safeDbRequest(
        () =>
          db.qr_items_supp.create({
             order_item_id: itemInDb.dataValues.id,
             drink_id:item.drink_id
          }),
        {}
      );
      const saucesIds =item.suaces_ids
      for(let sauceId in saucesIds ||[]){
        const sauceInDb = await safeDbRequest(
          () =>
            db.qr_item_sauce.create({
               items_id: itemInDb.dataValues.id,
               sauce_id:saucesIds[sauceId]
            }),
          {}
        );
      }
    }
  }

  if (order.customer_tel != "") {
    const myRest = await safeDbRequest(
      () =>
        db.qr_restaurant.findOne({
          where: {
            id: user_id,
          },
        }),
      {}
    );
    let axiosConfig = {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Access-Control-Allow-Origin": "*",
      },
    };

  
    if (myRest.hasSMS == true) {
      axios
        .post(
          "http://192.168.1.13/API/sms.php",
          {
            fullname: order.customer_name,
            restaurant: myRest.name,
            id: orderInDb.dataValues.id,
            adr: order.customer_adress,
            phone: order.customer_tel,
            api: process.env.KEY_SMS,
          },
          axiosConfig
        )
        .then((req, res) => {
       
          // console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
  let params = await safeDbRequest(() => {
    return db.qr_parameters.findOne({
      where: { nom: "PARAM_URL_NEW_ORDER" },
    });
  }, {});

 
  axios
    .get(`${params.valeur}?id=${user_id}&order_id=${orderInDb.dataValues.id}`)
    .then((res) => console.log("res.data"))
    .catch((err) => console.log(err));

  res.send(orderInDb.dataValues);
});

app.post("/api/printnotefrais", async (req, res) => {
  const { user_id, order } = req.body;


  const restInDb = await safeDbRequest(
    () => db.qr_restaurant.findOne({ where: { user_id: user_id } }),
    {}
  );
  let bornfromDb = await safeDbRequest(() => {
    return db.qr_borne.findOne({
      where: { rest_id: user_id },
    });
  }, {});
  let paymentsInDb = await safeDbRequest(() => {
    return db.qr_payment.findAll({
      where: { order_id: order.order_id },
    });
  }, []);
  // paymentsInDb.map((one, key) => ({
  //   ...one,
  //   amount: key > 0 ? one.amount - one[key - 1].amount : one.amount,
  // }));
 
  const restaurant = {
    wifi: restInDb.dataValues.wifi,
    ip_printer: restInDb.dataValues.ip_printer,
    name: restInDb.dataValues.name,
    address: restInDb.dataValues.address,
    telephone: restInDb.dataValues.telephone,
    delivery_minimum: restInDb.dataValues.delivery_minimum,
    frais: restInDb.dataValues.frais,
    ng:restInDb.dataValues.dynamic_ngrok_link
  };

  const post_data = {
    initData: {
      logoSrc: "/",
    },
    restaurant,
    tvas: order.tvas,
    payments: paymentsInDb,
    userName: order.customer_name || "client",
    customer_adress: order.customer_adress || "",
    phone: order.customer_tel,
    amount: order.amount,
    amountPaid: order.amountPaid,
    paymentType: order.paymentType,
    
    order: {
      remarque: order.message,
      id: order.order_id,
      orderType: order.orderType,
      table_number: order.table_number,
      totalPrice: order.totalPrice,
      nbrCouvert: order.nbrCouverts,
      orderItems: order.orderItems,
    },
  };
 
  let axiosConfig = {
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
    },
  };
  const notefrais = await safeDbRequest(
    () =>
      axios.post(
        post_data.restaurant.ng+"/notefrais.php",
        post_data,
        axiosConfig
      ),
    {}
  );

  res.sendStatus(200);
});

app.post("/api/getRestaurantData", async (req, res) => {
  const { user_id } = req.body;
  const restInDb = await safeDbRequest(
    () => db.qr_restaurant.findOne({ where: { user_id: user_id } }),
    {}
  );

  const restaurant = {
    wifi: restInDb.dataValues.wifi,
    name: restInDb.dataValues.name,
    address: restInDb.dataValues.address,
    telephone: restInDb.dataValues.telephone,
    delivery_minimum: restInDb.dataValues.delivery_minimum,
    frais: restInDb.dataValues.frais,
  };
  res.status(200).send(restaurant);
});

app.post("/api/printOrder", async (req, res) => {
  const { user_id, order, kitchen } = req.body;

  let tva = 0;
  let is_alcool = false;
  let test = order.orderItems;
  order.orderItems.forEach((element) => {
    if (element.is_alcool == true) {
      is_alcool = true;
    }
  });
  if (is_alcool == true) {
    tva = 20;
  } else {
    switch (order.orderType) {
      case "sur place":
        tva = 10;
        break;
      case "emporter":
        tva = 5.5;
        break;
      case "livraison":
        tva = 5.5;
        break;
      default:
        tva = 10;
        break;
    }
  }
  const restInDb = await safeDbRequest(
    () => db.qr_restaurant.findOne({ where: { user_id: user_id } }),
    {}
  );
  let bornfromDb = await safeDbRequest(() => {
    return db.qr_borne.findOne({
      where: { rest_id: user_id },
    });
  }, {});
  let paymentsInDb = await safeDbRequest(() => {
    return db.qr_payment.findAll({
      where: { order_id: order.order_id },
    });
  }, []);

  const restaurant = {
    wifi: restInDb.dataValues.wifi,
    ip_printer: restInDb.dataValues.ip_printer,
    ip_bar: restInDb.dataValues.ip_bar,
    ip_kitchen: restInDb.dataValues.ip_kitchen,
    dynamic_ngrok_link: restInDb.dataValues.dynamic_ngrok_link,
    name: restInDb.dataValues.name,
    address: restInDb.dataValues.address,
    telephone: restInDb.dataValues.telephone,
    delivery_minimum: restInDb.dataValues.delivery_minimum,
    frais: restInDb.dataValues.frais,
  };

 
  var typearray = [
    "espece",
    "carte bleu",
    "ticket restaurant",
    "cheque",
    "Especes",
    "Glovo",
    "Just-Eat",
    "Deliveroo",
    "Uber Eats",
  ];
  var newarray = [];
  for (let index = 0; index < typearray.length; index++) {
    const type = typearray[index];
    var sm = 0;
    paymentsInDb.forEach((element) => {
      if (element.pay_method == type) {
        sm = sm + element.amount;
      }
     
    });

    if (sm > 0) {
      newarray.push({
        amount: sm,
        pay_method: type,
      });
    }
  }

 

  let post_data = {
    initData: {
      logoSrc: "/",
    },
    
    restaurant,
    tvas: tva,
    payments: newarray,
    userName: order.customer_name || "client",
    customer_adress: order.customer_adress || "",
    phone: order.customer_tel,
    amount: order.amount,
    amountPaid: order.amountPaid,
    paymentType: order.paymentType,
    new: order.new,
    type: "tout",
    order: {
      TTCprice:order.totalPrice,
      remarque: order.message,
      id: order.order_id,
      orderType: order.orderType,
      tvas: tva,
      from_kiosk:order.from_kiosk,
      taxPrice: order.totalPrice/(1+(tva/100))*tva/100,
      table_number: order.table_number,
      totalPrice: order.totalPrice/(1+(tva/100)),
      nbrCouvert: order.nbrCouverts,
      orderItems: ((items) => {
        items = items.map((item) => {
          if (item.extras?.length) {
            return { ...item, count: item.qt };
          } else if (item.slots && Object.keys(item.slots).length) {
            return {
              ...item,
              count: item.qt,
              slots: ((slots) => {
                slots = JSON.parse(JSON.stringify(slots));
                try {
                  slotsCopy = {};
                  const slotKeys = Object.keys(slots);
                  for (let slotKey of slotKeys) {
                    let slot = slots[slotKey];
                    let slotmap = {
                      products: slot.products
                        ?.filter((p) => p.checked)
                        .map((product) => ({
                          name: product.name,
                          price: product.price,
                        })),
                    };
                    slotsCopy[slotKey] = slotmap;
                  }
                  return slotsCopy;
                } catch (e) {
                 
           
                  throw e;
                }
              })(item.slots),
            };
          } else if (item.stepItems && Object.keys(item.stepItems).length > 0) {
            return {
              ...item,
              stepItems: Object.values(item.stepItems).flat(1),
            };
          } else {
            return item;
          }
        });
        items.sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });
        let rv = [];
        for (let key in items) {
          let current = items[key];
          if (rv.length === 0) {
            if ((current.extras && current.extras.length) || current.isComp)
              rv = [current];
            else
              rv = [
                {
                  ...current,
                  count: 1,
                },
              ];
          } else {
            let last = rv[rv.length - 1];
            if ((current.extras && current.extras.length) || current.isComp) {
              rv = [...rv, current];
            } else {
              rv = [
                ...rv,
                {
                  ...current,
                  count: 1,
                },
              ];
            }
          }
        }
        items = rv;
        return items;
      })(order.orderItems),
    },
  };

  let axiosConfig = {
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
    },
  };
console.log("chej",JSON.stringify(post_data))
  const caisse = await safeDbRequest(
    () =>
      axios.post(post_data.restaurant.dynamic_ngrok_link+"/main.php", post_data, axiosConfig),
    {}
  );

  if (kitchen == true) {
    let kitchen_type = order.orderItems.find((el) => el.is_hot == true);
    let bar_type = order.orderItems.find((el) => el.is_cold == true);
     
    if (kitchen_type !== undefined) {
      post_data = { ...post_data, ip_type: "kitchen" };
     
      const kitchenprint = await safeDbRequest(
        () =>
          axios.post(
            post_data.restaurant.dynamic_ngrok_link+"/kitchen.php",
            post_data,
            axiosConfig
          ),
        {}
      );
    }
    if (bar_type !== undefined) {
      post_data = { ...post_data, ip_type: "bar" };
     
      const kitchenprint = await safeDbRequest(
        () =>
          axios.post(
            post_data.restaurant.dynamic_ngrok_link+"/kitchen.php",
            post_data,
            axiosConfig
          ),
        {}
      );
    }
  }
  res.sendStatus(200);
});

app.post("/api/printFinalOrder", async (req, res) => {
  const { user_id, order, type, part, pricepart,isavoir } = req.body;
 console.log(order)
  let tva = 0;
  let is_alcool = false;
  let test = order.orderItems;
  order.orderItems.forEach((element) => {
    if (element.tva == 20) {
      is_alcool = true;
    }
  });
  if (is_alcool == true) {
    tva = 20;
  } else {
    switch (order.orderType) {
      case "sur place":
        tva = 10;
        break;
      case "emporter":
        tva = 5.5;
        break;
      case "livraison":
        tva = 5.5;
        break;
      default:
        tva = 10;
        break;
    }
  }
  const restInDb = await safeDbRequest(
    () => db.qr_restaurant.findOne({ where: { user_id: user_id } }),
    {}
  );
  let bornfromDb = await safeDbRequest(() => {
    return db.qr_borne.findOne({
      where: { rest_id: user_id },
    });
  }, {});

  let paymentsInDb = await safeDbRequest(() => {
    return db.qr_payment.findAll({
      where: { order_id: order.order_id },
    });
  }, []);

  
  const restaurant = {
    wifi: restInDb.dataValues.wifi,
    ip_printer: restInDb.dataValues.ip_printer,
    ip_bar: restInDb.dataValues.ip_bar,
    name: restInDb.dataValues.name,
    address: restInDb.dataValues.address,
    telephone: restInDb.dataValues.telephone,
    delivery_minimum: restInDb.dataValues.delivery_minimum,
    frais: restInDb.dataValues.frais,
    ng:restInDb.dataValues.dynamic_ngrok_link
  };

  
  var typearray = [
    "espece",
    "carte bleu",
    "ticket restaurant",
    "cheque",
    "Especes",
    "Uber Eats",
    "Deliveroo",
    "Just-Eat","Glovo"
  ];
  var newarray = [];
  for (let index = 0; index < typearray.length; index++) {
    const type = typearray[index];
    var sm = 0;
    paymentsInDb.forEach((element) => {
      if (element.pay_method == type) {
        sm = sm + element.amount;
      }
     
    });
  
    if (sm > 0) {
      newarray.push({
        amount: sm,
        pay_method: type,
      });
    }
  }
  let post_data = {
    initData: {
      logoSrc: "/",
    },
    restaurant,
    type: type,
    pricepart: pricepart,
    tvas: tva,
    payments: order.payments ||newarray,
    numbrpayment: order.numbrpayment,
    userName: order.customer_name || "client",
    customer_adress: order.customer_adress || "",
    phone: order.customer_tel,
    
    amountPaid: order.amountPaid,
    paymentType: order.paymentType,
    new: order.new,
    part: part,
    order: {
      TTCprice:order.totalPrice,
      remarque: order.message,
      client_id:order.client_id,
      id: order.order_id,
      orderType: order.orderType,
      table_number: order.table_number,
      totalPrice: order.totalPrice/(1+(tva/100)),
      taxPrice: order.totalPrice/(1+(tva/100))*tva/100,
      nbrCouvert: order.nbrCouverts,
      orderItems: ((items) => {
        items = items.map((item) => {
          if (item.extras?.length) {
            return { ...item, count: item.qt };
          } else if (item.slots && Object.keys(item.slots).length) {
            return {
              ...item,
              count: item.qt,
              slots: ((slots) => {
                slots = JSON.parse(JSON.stringify(slots));
                try {
                  slotsCopy = {};
                  const slotKeys = Object.keys(slots);
                  for (let slotKey of slotKeys) {
                    let slot = slots[slotKey];
                    let slotmap = {
                      products: slot.products
                        ?.filter((p) => p.checked)
                        .map((product) => ({
                          name: product.name,
                          price: product.price,
                        })),
                    };
                    slotsCopy[slotKey] = slotmap;
                  }
                  return slotsCopy;
                } catch (e) {
                 
                  
              
                  throw e;
                }
              })(item.slots),
            };
          } else if (item.stepItems && Object.keys(item.stepItems).length > 0) {
            return {
              ...item,
              stepItems: Object.values(item.stepItems).flat(1),
            };
          } else {
            return item;
          }
        });
        items.sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });
        let rv = [];
        for (let key in items) {
          let current = items[key];
          if (rv.length === 0) {
            if ((current.extras && current.extras.length) || current.isComp)
              rv = [current];
            else
              rv = [
                {
                  ...current,
                  count: 1,
                },
              ];
          } else {
            let last = rv[rv.length - 1];
            if ((current.extras && current.extras.length) || current.isComp) {
              rv = [...rv, current];
            } else {
              rv = [
                ...rv,
                {
                  ...current,
                  count: 1,
                },
              ];
            }
          }
        }
        items = rv;
        return items;
      })(order.orderItems),
    },
  };
 
  let axiosConfig = {
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
    },
  };
  try {
    const caisse = await safeDbRequest(
      () =>
        axios.post(post_data.restaurant.ng+"/main.php", post_data, axiosConfig),
      {}
    );
  } catch (error) {
    console.log(error);
  }

  /*   if (type == "partage") {
    for (let index = 0; index < part; index++) {
      const caisse = await safeDbRequest(
        () =>
          axios.post(
            "http://192.168.1.13/main.php",
            post_data,
            axiosConfig
          ),
        {}
      );
    }
  } else {
    const caisse = await safeDbRequest(
      () =>
        axios.post("http://192.168.1.13/main.php", post_data, axiosConfig),
      {}
    );
  } */ //192.168.1.13
  
  if (
    order.paymentType == "ticket restaurant" &&
    order.totalPrice + order.taxPrice < order.amountPaid|| isavoir==true
  ) {
   
    let today = new Date().toISOString().slice(0, 10);
    var day = new Date();
    var dd = String(day.getDate()).padStart(2, "0");
    var mm = String(day.getMonth()).padStart(2, "0");
    var mmater = String(day.getMonth() + 2).padStart(2, "0"); //January is 0!
    var yyyy = day.getFullYear();
    day = yyyy + "-" + mmater + "-" + Number(dd).toString()
    var code =''
      var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var charactersLength = characters.length;
      for ( var i = 0; i < 4; i++ ) {
        code += characters.charAt(Math.floor(Math.random() * 
   charactersLength));
     }
    const couponInDb = await safeDbRequest(() => {
      return db.qr_coupon.create({
        code: code,
        user_id: user_id,
        discount: order.amountPaid - (order.totalPrice + order.taxPrice),
        discount_percent: 0,
        number_use: 0,
        used: 0,
        created_at: today,
        expires_at: day,
        id_client:order.client_id
      });
    }, {});
   
    post_data = {
      ...post_data,
      code: code,
      expires_at: day,
      discount: order.amountPaid - (order.totalPrice + order.taxPrice),
    };
    var t = JSON.stringify(post_data);
  
    // const UpdatedOrder = await safeDbRequest(
    //   () =>
    //     db.qr_orders.update(
    //       {
    //         code1: couponInDb.code,
    //       },
    //       { where: { id: order.order_id } }
    //     ),
    //   {}
    // );
    const avoir = await safeDbRequest(
      () =>
        axios.post(post_data.restaurant.ng+"/avoir.php", post_data, axiosConfig),
      {}
    );
  }
  // const kitchen = await safeDbRequest(
  //   () =>
  //     axios.post("http://192.168.1.13/caisse/kitchen.php", post_data, axiosConfig),
  //   {}
  // );

  res.sendStatus(200);
});

app.post("/api/verifyCoupon", async (req, res) => {
  const { code, user_id } = req.body;
  let couponInDb = await safeDbRequest(() => {
    return db.qr_coupon.findOne({
      where: { code: code,user_id:user_id },
    });
  }, null);
 if(couponInDb==null){
  res.status(200).send({ msg: "non trouvée" })
 }

  if (couponInDb.dataValues.discount > 0) {
    if (couponInDb) {
      let deleteCoupon = await safeDbRequest(() => {
        return db.qr_coupon.destroy(
         
          { where: { code: code } }
        );
      }, null);

     
      res.status(200).send({ msg: "trouvée", couponInDb, status: "incomplet" });
    } else {
      res.status(200).send({ msg: "trouvée", couponInDb, status: "achevé" });
    }
  } else {
    res.status(400).send({ msg: "non trouvée" });
  }
});
app.post("/api/updatehow_paid", async (req, res) => {
  const { type, order } = req.body;
  try {
    const UpdatedOrder = await safeDbRequest(
      () =>
        db.qr_orders.update(
          {
            how_paid: type,
          },
          { where: { id: order.order_id } }
        ),
      {}
    );
    res.send(UpdatedOrder);
  } catch (error) {
    console.error(error);
  }
});
app.post("/api/finalizeorder", async (req, res) => {
  const { order, amountnow,isavoir } = req.body;

  if (order.amount != 0) {
    try {
      const UpdatedOrder = await safeDbRequest(
        () =>
          db.qr_orders.update(
            {customer_id:order.client_id,
              customer_name:order.client_name,
              status: "completed",
              message: order.message,
              pay_method: order.pay_method,
            },
            { where: { id: order.order_id } }
          ),
        {}
      );
      const paymentInDb = await safeDbRequest(() => {
        return db.qr_payment.create({
          order_id: order.order_id,
          pay_method: order.pay_method,
          amount: order.amount,
        });
      }, {});

      if (UpdatedOrder) {
        const UpdatedTable = await safeDbRequest(
          () =>
            db.qr_table.update(
              { libre: true },
              { where: { id: order.table_number } }
            ),
          {}
        );
      }
     
      res.send(UpdatedOrder);
    } catch (err) {
      res.status(400).send({ msg: err });
    }
  }
});

app.post(`/api/getMonnaie`, async (req, res) => {
  const { user_id } = req.body;
  try {
    let monnaies = await safeDbRequest(
      () =>
        db.qr_monnaie.findAll({
          where: {
            user_id: user_id,
          },
        }),
      []
    );
    monnaies = monnaies.map((e) => e.dataValues);

    res.send(monnaies);
  } catch (err) {
    res.status(400).send({ msg: err });
  }
});

app.post(`/api/OpenCaisse`, async (req, res) => {
  const { historiquePrint, historique_monnaie, user_id, user, montant } =
    req.body;

  const HistoriqueInDb = await safeDbRequest(() => {
    return db.qr_historique.create({
      caisse_id: historiquePrint.caisse_id,
      date: historiquePrint.date,
      montant: historiquePrint.montant,
      type: historiquePrint.type,
    });
  }, {});

  // HistoriqueInDb = HistoriqueInDb.dataValues;

  for (let histMonnaie of historique_monnaie || []) {
    const histMonnaieInDb = await safeDbRequest(
      () =>
        db.qr_historique_monnaie.create({
          historique_id: HistoriqueInDb.dataValues.id,
          type: histMonnaie.type,
          qt: histMonnaie.qt,
        }),
      {}
    );
  }

  const UpdatedCaisse = await safeDbRequest(
    () =>
      db.qr_caisse.update(
        { is_open: true },
        { where: { id: HistoriqueInDb.dataValues.caisse_id } }
      ),
    {}
  );



  const createdLog = await safeDbRequest(
    () =>
      db.qr_log.create({
        title_log: "Ouverture de caisse",
        content_log: `ouverture de la caisse par le serveur ${user} avec un montant de ${montant} euro`,
        id_rest: user_id,
        user: user,
      }),
    {}
  );
 

  res.send({ historiquePrint: HistoriqueInDb.dataValues });
});

app.post("/api/pushlog", async (req, res) => {
  let { user_id, user, faire, title, content } = req.body;

  const createdLog = await safeDbRequest(
    () =>
      db.qr_log.create({
        title_log: title,
        content_log: `${content} ${user} ${faire}`,
        id_rest: user_id,
        user: user,
      }),
    {}
  );

  res.status(200).send;
});

app.post(`/api/CloseCaisse`, async (req, res) => {
  const { historiquePrint, user_id, user, montant } = req.body;
  try {
    const HistoriqueInDb = await safeDbRequest(() => {
      return db.qr_historique.create({
        caisse_id: historiquePrint.caisse_id,
        date: historiquePrint.date,
        montant: historiquePrint.montant,
        type: historiquePrint.type,
      });
    }, {});

    const UpdatedCaisse = await safeDbRequest(
      () =>
        db.qr_caisse.update(
          { is_open: false },
          { where: { id: historiquePrint.caisse_id } }
        ),
      {}
    );

    const createdLog = await safeDbRequest(
      () =>
        db.qr_log.create({
          title_log: "Cloture de caisse",
          content_log: `Cltoure de la caisse par le serveur ${user} avec un montant de ${montant} euro`,
          id_rest: user_id,
          user: user,
        }),
      {}
    );

    res.send(UpdatedCaisse);
  } catch (err) {
    res.status(400).send({ msg: err });
  }
});

app.use(express.static(path.join(__dirname, "/build")));

app.listen(process.env.PORT || 5000, (err) => {
  err ? console.log(err) : console.log("server is running !");
});
