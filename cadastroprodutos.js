const inputImagem = document.getElementById("imagem");
const previewImagem = document.getElementById("previewImagem");
const btnSalvar = document.getElementById("btnSalvar");

const listaProdutosCadastrados =
    document.getElementById("listaProdutosCadastrados");


// Guarda o ID do produto que está sendo editado
let produtoEmEdicao = null;


// ================================
// Impede digitar ou colar valores negativos nos campos numéricos.
[
    document.getElementById("preco"),
    document.getElementById("precoOferta"),
    document.getElementById("estoque")
].forEach((campo) => {
    campo.min = "0";
    campo.addEventListener("keydown", (evento) => {
        if (evento.key === "-" || evento.key === "e" || evento.key === "E") {
            evento.preventDefault();
        }
    });
    campo.addEventListener("input", () => {
        if (campo.value.includes("-") || Number(campo.value) < 0) {
            campo.value = "";
        }
    });
});
// PREVIEW DA IMAGEM
// ================================

inputImagem.addEventListener("change", () => {

    const arquivo = inputImagem.files[0];

    if (!arquivo) {
        return;
    }

    const leitor = new FileReader();

    leitor.onload = function (evento) {

        previewImagem.src = evento.target.result;

        previewImagem.style.display = "block";
    };

    leitor.readAsDataURL(arquivo);
});


// ================================
// SALVAR / EDITAR PRODUTO
// ================================

btnSalvar.addEventListener("click", () => {

    const nome =
        document.getElementById("nome").value.trim();

    const descricao =
        document.getElementById("descricao").value.trim();

    const categoria =
        document.getElementById("categoria").value;

    const preco =
        Number(document.getElementById("preco").value);

    const precoOferta =
        Number(document.getElementById("precoOferta").value);

    const estoqueCampo = document.getElementById("estoque").value.trim();
    const estoque = Number(estoqueCampo);

    const oferta =
        document.getElementById("oferta").checked;

    const destaque =
        document.getElementById("destaque").checked;


    // ================================
    // VALIDAÇÃO
    // ================================

    const precoOfertaValido = !oferta || (
        Number.isFinite(precoOferta) && precoOferta > 0 && precoOferta < preco
    );

    let mensagemErro = "";

    if (!nome || !descricao || !categoria) {
        mensagemErro = "Preencha nome, descrição e categoria.";
    } else if (!Number.isFinite(preco) || preco <= 0) {
        mensagemErro = "Informe um preço maior que zero.";
    } else if (estoqueCampo === "" || !Number.isInteger(estoque) || estoque < 0) {
        mensagemErro = "O estoque deve ser um número inteiro igual ou maior que zero.";
    } else if (!precoOfertaValido) {
        mensagemErro = "Na oferta, informe um preço maior que zero e menor que o preço normal.";
    }

    if (mensagemErro) {
        mostrarNotificacao(mensagemErro, "erro");
        return;
    }

    const precoOfertaSalvo = oferta ? precoOferta : 0;


    // ================================
    // BUSCA PRODUTOS DO LOCALSTORAGE
    // ================================

    let produtosSalvos =
        JSON.parse(localStorage.getItem("produtos")) || [];


    // ================================
    // EDIÇÃO
    // ================================

    if (produtoEmEdicao !== null) {

        const indiceProduto =
            produtosSalvos.findIndex(
                produto => produto.id === produtoEmEdicao
            );

        if (indiceProduto === -1) {

            mostrarNotificacao("Produto não encontrado.", "erro");

            return;
        }


        // Mantém a imagem antiga caso
        // nenhuma nova imagem seja escolhida

        const imagem =
            previewImagem.src ||
            produtosSalvos[indiceProduto].urlimagem;


        produtosSalvos[indiceProduto] = {

            ...produtosSalvos[indiceProduto],

            nome: nome,

            idcategoria: Number(categoria),

            descrição: descricao,

            preço: preco,

            preçooferta: precoOfertaSalvo,

            quantidadedeestoque: estoque,

            urlimagem: imagem,

            oferta: oferta,

            destaque: destaque
        };


        localStorage.setItem(
            "produtos",
            JSON.stringify(produtosSalvos)
        );


        mostrarNotificacao("Produto atualizado com sucesso!");

        produtoEmEdicao = null;

        btnSalvar.textContent = "Salvar";

    }


    // ================================
    // NOVO PRODUTO
    // ================================

    else {

        const maiorIdExistente = Math.max(
            0,

            ...produtos.map(
                produto => produto.id
            ),

            ...produtosSalvos.map(
                produto => produto.id
            )
        );


        const novoId =
            maiorIdExistente + 1;


        const novoProduto = {

            id: novoId,

            nome: nome,

            idcategoria: Number(categoria),

            descrição: descricao,

            preço: preco,

            preçooferta: precoOfertaSalvo,

            quantidadedeestoque: estoque,

            urlimagem: previewImagem.src || "",

            oferta: oferta,

            destaque: destaque
        };


        produtosSalvos.push(novoProduto);


        localStorage.setItem(
            "produtos",
            JSON.stringify(produtosSalvos)
        );


        mostrarNotificacao("Produto cadastrado com sucesso!");
    }


    limparFormulario();

    mostrarProdutosCadastrados();

});


// ================================
// MOSTRAR PRODUTOS CADASTRADOS
// ================================

function mostrarProdutosCadastrados() {

    const produtosSalvos =
        JSON.parse(localStorage.getItem("produtos")) || [];


    listaProdutosCadastrados.innerHTML = "";


    if (produtosSalvos.length === 0) {

        listaProdutosCadastrados.innerHTML =
            "<p>Nenhum produto cadastrado.</p>";

        return;
    }


    produtosSalvos.forEach(produto => {

        listaProdutosCadastrados.innerHTML += `
            <div class="produto-cadastrado">

                <img
                    src="${produto.urlimagem}"
                    alt="${produto.nome}"
                >

                <div class="produto-cadastrado-info">

                    <strong>
                        ${produto.nome}
                    </strong>

                    <span>
                        R$ ${produto.preço
                            .toFixed(2)
                            .replace(".", ",")}
                    </span>

                </div>

                <div class="acoes-produto">

                    <button
                        type="button"
                        class="btn-editar"
                        onclick="editarProduto(${produto.id})"
                    >
                        <i class="fa-solid fa-pen"></i>
                        Editar
                    </button>

                    <button
                        type="button"
                        class="btn-excluir"
                        onclick="excluirProduto(${produto.id})"
                    >
                        <i class="fa-solid fa-trash"></i>
                        Excluir
                    </button>

                </div>

            </div>
        `;
    });
}


// ================================
// EDITAR PRODUTO
// ================================

function editarProduto(id) {

    const produtosSalvos =
        JSON.parse(localStorage.getItem("produtos")) || [];


    const produto =
        produtosSalvos.find(
            produto => produto.id === id
        );


    if (!produto) {
        return;
    }


    produtoEmEdicao = id;


    // Preenche o formulário

    document.getElementById("nome").value =
        produto.nome;

    document.getElementById("descricao").value =
        produto.descrição;

    document.getElementById("categoria").value =
        produto.idcategoria;

    document.getElementById("preco").value =
        produto.preço;

    document.getElementById("precoOferta").value =
        produto.preçooferta;

    document.getElementById("estoque").value =
        produto.quantidadedeestoque;

    document.getElementById("oferta").checked =
        produto.oferta;

    document.getElementById("destaque").checked =
        produto.destaque;


    // Mostra a imagem atual

    if (produto.urlimagem) {

        previewImagem.src =
            produto.urlimagem;

        previewImagem.style.display =
            "block";
    }


    // Muda o texto do botão

    btnSalvar.textContent =
        "Salvar alterações";


    // Volta para o formulário

    document
        .querySelector(".formulario-produto")
        .scrollIntoView({
            behavior: "smooth"
        });
}


// ================================
// EXCLUIR PRODUTO
// ================================

async function excluirProduto(id) {

    const confirmar = await confirmarAcao("Deseja excluir este produto?");
    if (!confirmar) return;


    let produtosSalvos =
        JSON.parse(localStorage.getItem("produtos")) || [];


    produtosSalvos =
        produtosSalvos.filter(
            produto => produto.id !== id
        );


    localStorage.setItem(
        "produtos",
        JSON.stringify(produtosSalvos)
    );


    // Se estiver editando justamente
    // o produto excluído

    if (produtoEmEdicao === id) {

        produtoEmEdicao = null;

        btnSalvar.textContent = "Salvar";

        limparFormulario();
    }


    mostrarProdutosCadastrados();
}


// ================================
// LIMPAR FORMULÁRIO
// ================================

function limparFormulario() {

    document.getElementById("nome").value = "";

    document.getElementById("descricao").value = "";

    document.getElementById("categoria").value = "";

    document.getElementById("preco").value = "";

    document.getElementById("precoOferta").value = "";

    document.getElementById("estoque").value = "";

    document.getElementById("oferta").checked = false;

    document.getElementById("destaque").checked = false;


    inputImagem.value = "";

    previewImagem.src = "";

    previewImagem.style.display = "none";
}


// ================================
// MOSTRA A LISTA AO ABRIR A PÁGINA
// ================================

mostrarProdutosCadastrados();


/* =========================================
   NOTIFICAÇÃO PERSONALIZADA - SPAN GAMES
========================================= */

let temporizadorNotificacao;

function mostrarNotificacao(mensagem, tipo = "sucesso") {

    let notificacao =
        document.getElementById("notificacaoProduto");

    if (!notificacao) {
        notificacao = document.createElement("div");
        notificacao.id = "notificacaoProduto";
        notificacao.className = "notificacao-produto";
        notificacao.setAttribute("role", "status");
        notificacao.setAttribute("aria-live", "polite");
        document.body.appendChild(notificacao);
    }

    notificacao.textContent = mensagem;

    notificacao.className =
        `notificacao-produto ${tipo} mostrar`;

    clearTimeout(temporizadorNotificacao);

    temporizadorNotificacao = setTimeout(() => {
        notificacao.classList.remove("mostrar");
    }, 3000);
}

// Confirmação personalizada para evitar a janela nativa do navegador.
function confirmarAcao(mensagem) {
    return new Promise((resolver) => {
        const fundo = document.createElement("div");
        fundo.className = "confirmacao-produto-fundo";
        fundo.innerHTML = `
            <div class="confirmacao-produto" role="dialog" aria-modal="true" aria-labelledby="tituloConfirmacao">
                <p id="tituloConfirmacao">${mensagem}</p>
                <div class="confirmacao-produto-acoes">
                    <button type="button" class="confirmacao-cancelar">Cancelar</button>
                    <button type="button" class="confirmacao-aceitar">Excluir</button>
                </div>
            </div>`;
        document.body.appendChild(fundo);
        const finalizar = (resultado) => { fundo.remove(); resolver(resultado); };
        fundo.querySelector(".confirmacao-cancelar").addEventListener("click", () => finalizar(false));
        fundo.querySelector(".confirmacao-aceitar").addEventListener("click", () => finalizar(true));
        fundo.addEventListener("click", (evento) => { if (evento.target === fundo) finalizar(false); });
    });
}