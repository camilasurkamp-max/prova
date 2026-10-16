import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('biblioteca.db');

export default function Biblioteca() {
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [paginas, setPaginas] = useState('');
  const [lista, setLista] = useState([]);
  const [idEditar, setIdEditar] = useState(null);

  useEffect(() => {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS livros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT,
        autor TEXT,
        paginas INTEGER
      )
    `);
    listar();
  }, []);

  function listar() {
    const dados = db.getAllSync('SELECT * FROM livros');
    setLista(dados);
  }

  function salvar() {
    const numeroPaginas = Number(paginas);

    if (
      !titulo.trim() ||
      !autor.trim() ||
      !paginas.trim() ||
      !Number.isInteger(numeroPaginas) ||
      numeroPaginas <= 0
    ) {
      alert('Preencha os campos corretamente');
      return;
    }

    if (idEditar !== null) {
      db.runSync(
        'UPDATE livros SET titulo = ?, autor = ?, paginas = ? WHERE id = ?',
        [titulo, autor, numeroPaginas, idEditar]
      );
    } else {
      db.runSync(
        'INSERT INTO livros (titulo, autor, paginas) VALUES (?, ?, ?)',
        [titulo, autor, numeroPaginas]
      );
    }

    setTitulo('');
    setAutor('');
    setPaginas('');
    setIdEditar(null);
    listar();
  }

  function editar(livro) {
    setTitulo(livro.titulo);
    setAutor(livro.autor);
    setPaginas(String(livro.paginas));
    setIdEditar(livro.id);
  }

  function excluir(id) {
    db.runSync('DELETE FROM livros WHERE id = ?', [id]);
    listar();
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 15 }}>
        Biblioteca Pessoal
      </Text>

      <TextInput
        placeholder="Título do livro"
        value={titulo}
        onChangeText={setTitulo}
        style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
      />

      <TextInput
        placeholder="Autor"
        value={autor}
        onChangeText={setAutor}
        style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
      />

      <TextInput
        placeholder="Número de páginas"
        value={paginas}
        onChangeText={setPaginas}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
      />

      <Button
        title={idEditar !== null ? 'Atualizar' : 'Cadastrar'}
        onPress={salvar}
      />

      <FlatList
        data={lista}
        keyExtractor={(livro) => String(livro.id)}
        renderItem={({ item: livro }) => (
          <View style={{ marginTop: 15 }}>
            <Text>
              {livro.titulo} - {livro.autor} - {livro.paginas} páginas
            </Text>

            <Button
              title="Editar"
              onPress={() => editar(livro)}
            />

            <Button
              title="Excluir"
              onPress={() => excluir(livro.id)}
            />
          </View>
        )}
      />
    </View>
  );
}