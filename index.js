const express = require("express");
const app = express();
const puppeteer = require("puppeteer");
const path = require("path");
const port = 3000;

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
app.use("/public", express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "pages"));

const listaMoedas = [
  {
    id: 1,
    nome: "dolar",
    rota: "",
    imagem: "https://dolarhoje.com/img/icon-dolar.gif",
  },
  {
    id: 2,
    nome: "euro",
    rota: "euro-hoje",
    imagem: "https://dolarhoje.com/img/icon-euro.gif",
  },
  {
    id: 3,
    nome: "bitcoin",
    rota: "bitcoin-hoje",
    imagem: "https://dolarhoje.com/img/icon-bitcoin.gif",
  },
  {
    id: 4,
    nome: "ouro",
    rota: "ouro-hoje",
    imagem: "https://dolarhoje.com/img/icon-ouro.gif",
  },
];
app.get("/", (req, res) => {
  const id = req.query.moedas;
  if (id != undefined) {
    res.redirect(`/cotar/${req.query.moedas}`);
    return "";
  }
  res.render("index.html", { moedas: listaMoedas });
});

const buscarMoeda = (idProcurado) => {
  return listaMoedas.filter(({ id }) => {
    return id == idProcurado;
  });
};

app.get("/cotar/:id", async (req, res) => {
  const id = req.params.id;
  if (id.length > 0) {
    const rota = await buscarMoeda(id);
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(`https://dolarhoje.com/${rota[0]?.rota}/`);
    const dados = await page.evaluate(() => {
      return {
        moedaEstrangeira: document.querySelector("#estrangeiro").value,
        moedaNacional: document.querySelector("#nacional").value,
      };
    });

    await browser.close();
    return res.render("moeda.html", {
      moedaInternacional: dados.moedaEstrangeira,
      moedaNacional: dados.moedaNacional,
      moedaNome: "nome",
      moedaImagem: rota[0]?.imagem,
    });
  }
  res.redirect("/");
});

app.listen(port, (erro) => {
  if (erro) {
    console.log("Houve erro...");
    return "";
  }
  console.log("Óla mundo do Scraping, subiu que uma belezinha...");
});
