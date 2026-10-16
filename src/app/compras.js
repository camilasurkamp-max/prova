import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Pressable } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('compras.db');

export default function Compras() {
  const [item, setItem] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [comprado, setComprado] = useState(false);
  const [lista, setLista] = useState([]);
  const [idEditar, setIdEditar] = useState(null);

  useEffect(() => {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS compras (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item TEXT,
        quantidade INTEGER,
        comprado INTEGER
      )
    `);
    listar();
  }, []);

  function listar() {
    const dados = db.getAllSync('SELECT * FROM compras');
    setLista(dados);
  }

  function salvar() {
    const qtd = Number(quantidade);

    if (!item.trim() || !quantidade.trim() || !Number.isInteger(qtd) || qtd <= 0) {
      alert('Preencha o item e uma quantidade inteira maior que zero');
      return;
    }

    if (idEditar !== null) {
      db.runSync(
        'UPDATE compras SET item = ?, quantidade = ?, comprado = ? WHERE id = ?',
        [item, qtd, comprado ? 1 : 0, idEditar]
      );
    } else {
      db.runSync(
        'INSERT INTO compras (item, quantidade, comprado) VALUES (?, ?, ?)',
        [item, qtd, comprado ? 1 : 0]
      );
    }

    setItem('');
    setQuantidade('');
    setComprado(false);
    setIdEditar(null);
    listar();
  }

  function editar(produto) {
    setItem(produto.item);
    setQuantidade(String(produto.quantidade));
    setComprado(produto.comprado === 1);
    setIdEditar(produto.id);
  }

  function excluir(id) {
    db.runSync('DELETE FROM compras WHERE id = ?', [id]);
    listar();
  }

  function marcarComprado(produto) {
    const novoValor = produto.comprado === 1 ? 0 : 1;

    db.runSync(
      'UPDATE compras SET comprado = ? WHERE id = ?',
      [novoValor, produto.id]
    );

    listar();
  }

  function limparComprados() {
    db.runSync('DELETE FROM compras WHERE comprado = 1');
    listar();
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 15 }}>
        Lista de Compras
      </Text>

      <TextInput
        placeholder="Nome do item"
        value={item}
        onChangeText={setItem}
        style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
      />

      <TextInput
        placeholder="Quantidade"
        value={quantidade}
        onChangeText={setQuantidade}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
      />

      <Text>Comprado: {comprado ? 'Sim' : 'Não'}</Text>

      <Button
        title="Alterar comprado (Sim/Não)"
        onPress={() => setComprado(!comprado)}
      />

      <Button
        title={idEditar !== null ? 'Atualizar' : 'Cadastrar'}
        onPress={salvar}
      />

      <Button
        title="Limpar comprados"
        onPress={limparComprados}
      />

      <FlatList
        data={lista}
        keyExtractor={(produto) => String(produto.id)}
        renderItem={({ item: produto }) => (
          <View style={{ marginTop: 15 }}>
            <Pressable onPress={() => marcarComprado(produto)}>
              <Text
                style={{
                  textDecorationLine: produto.comprado === 1 ? 'line-through' : 'none',
                  fontSize: 16
                }}
              >
                {produto.item} - Quantidade: {produto.quantidade}
                {produto.comprado === 1 ? ' (Comprado)' : ' (Não comprado)'}
              </Text>
            </Pressable>

            <Button title="Editar" onPress={() => editar(produto)} />
            <Button title="Excluir" onPress={() => excluir(produto.id)} />
          </View>
        )}
      />
    </View>
  );
}