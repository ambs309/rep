"use client";

import { useEffect, useState } from "react";

type Produto = {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  // Podemos ter mais campos retornados pela API
  // Adicionaremos um idUnico caso necessário no carrinho
  idUnico?: string;
};

export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para filtros
  const [categoria, setCategoria] = useState("all");
  const [ordem, setOrdem] = useState("asc");
  const [pesquisa, setPesquisa] = useState("");

  // Estado do carrinho
  const [carrinho, setCarrinho] = useState<Produto[]>([]);

  // Fetch inicial dos produtos da API interna
  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await fetch("/api/produtos");
        if (!response.ok) {
          throw new Error(`Erro ao buscar produtos: ${response.statusText}`);
        }
        const data: Produto[] = await response.json();
        setProdutos(data);
        setProdutosFiltrados(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, []);

  // Carrega o carrinho do localStorage no primeiro render no cliente
  useEffect(() => {
    if (typeof window !== "undefined") {
      const carrinhoLocal = localStorage.getItem("produtos-selecionados");
      if (carrinhoLocal) {
        setCarrinho(JSON.parse(carrinhoLocal));
      }
    }
  }, []);

  // Atualiza localStorage sempre que o carrinho mudar
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("produtos-selecionados", JSON.stringify(carrinho));
    }
  }, [carrinho]);

  // Função para atualizar a lista de produtos filtrados
  useEffect(() => {
    let lista = [...produtos];

    // Filtrar por categoria
    if (categoria !== "all") {
      lista = lista.filter((prod) => prod.category === categoria);
    }

    // Pesquisar
    const textoPesquisa = pesquisa.toLowerCase();
    if (textoPesquisa) {
      lista = lista.filter((prod) =>
        prod.title.toLowerCase().includes(textoPesquisa)
      );
    }

    // Ordenar
    if (ordem === "asc") {
      lista.sort((a, b) => a.price - b.price);
    } else {
      lista.sort((a, b) => b.price - a.price);
    }

    setProdutosFiltrados(lista);
  }, [categoria, ordem, pesquisa, produtos]);

  // Função adicionar ao carrinho
  const adicionarAoCarrinho = (produto: Produto) => {
    const produtoComId = { ...produto, idUnico: crypto.randomUUID() };
    setCarrinho((prev) => [...prev, produtoComId]);
  };

  // Função remover do carrinho
  const removerDoCarrinho = (idUnico: string) => {
    setCarrinho((prev) => prev.filter((item) => item.idUnico !== idUnico));
  };

  const total = carrinho.reduce((acc, prod) => acc + prod.price, 0);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error}</p>;

  return (
    <div>
      <header>
        <h1>Loja Online</h1>
        <nav>
          <ul>
            <li><a href="#produtos">Produtos</a></li>
            <li><a href="#carrinho">Carrinho</a></li>
          </ul>
        </nav>
      </header>

      <div id="control-panel">
        <label htmlFor="filtro-categoria">Filtrar:</label>
        <select
          id="filtro-categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          <option value="all">Todas as categorias</option>
          <option value="T-shirts">T-shirts</option>
          <option value="Canecas">Canecas</option>
          <option value="Meias">Meias</option>
        </select>

        <label htmlFor="ordenar-preco">Ordenar:</label>
        <select
          id="ordenar-preco"
          value={ordem}
          onChange={(e) => setOrdem(e.target.value)}
        >
          <option value="asc">Ordenar pelo preço (crescente)</option>
          <option value="desc">Ordenar pelo preço (decrescente)</option>
        </select>

        <label htmlFor="pesquisar">Procurar:</label>
        <input
          type="text"
          id="pesquisar"
          placeholder="pesquise por produto"
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
        />
      </div>

      <main>
        <article id="produtos">
          <h2>Selecione os seus Produtos</h2>
          <section className="lista-produtos">
            {produtosFiltrados.map((produto) => (
              <div key={produto.id} className="product-card">
                <h3>{produto.title}</h3>
                <img src={produto.image} alt={produto.title} />
                <p>{produto.description}</p>
                <p>{produto.price.toFixed(2)} €</p>
                <button onClick={() => adicionarAoCarrinho(produto)}>
                  + Adicionar ao Carrinho
                </button>
              </div>
            ))}
          </section>
        </article>

        <article id="carrinho">
          <h2>Produtos Selecionados</h2>
          <section className="carrinho">
            {carrinho.map((produto) => (
              <div key={produto.idUnico} className="product-card">
                <h3>{produto.title}</h3>
                <img src={produto.image} alt={produto.title} />
                <p>{produto.price.toFixed(2)} €</p>
                <button onClick={() => produto.idUnico && removerDoCarrinho(produto.idUnico)}>
                  - Remover do Carrinho
                </button>
              </div>
            ))}
            <p className="total">Custo total: {total.toFixed(2)}€</p>
          </section>
        </article>
      </main>

      <footer>
        <p>André Sobreira | Universidade Lusófona | 2024</p>
      </footer>
    </div>
  );
}
