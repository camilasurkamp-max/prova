import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('contatos.db');

export default function Contatos() {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [lista, setLista] = useState([]);
  const [idEditar, setIdEditar] = useState(null);

  useEffect(() => {
    db.execSync(
      'CREATE TABLE IF NOT EXISTS contatos (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, telefone TEXT)'
    );
    listar();
  }, []);

  function listar() {
    const dados = db.getAllSync('SELECT * FROM contatos');
    setLista(dados);
  }

  function salvar() {
    if (!nome.trim() || !telefone.trim()) {
      alert('Preencha nome e telefone');
      return;
    }

    if (idEditar !== null) {
      db.runSync(
        'UPDATE contatos SET nome = ?, telefone = ? WHERE id = ?',
        [nome, telefone, idEditar]
      );
    } else {
      db.runSync(
        'INSERT INTO contatos (nome, telefone) VALUES (?, ?)',
        [nome, telefone]
      );
    }

    setNome('');
    setTelefone('');
    setIdEditar(null);
    listar();
  }

  function editar(item) {
    setNome(item.nome);
    setTelefone(item.telefone);
    setIdEditar(item.id);
  }

  function excluir(id) {
    db.runSync('DELETE FROM contatos WHERE id = ?', [id]);
    listar();
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Agenda de Contatos</Text>

      <TextInput
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        placeholder="Telefone"
        value={telefone}
        onChangeText={setTelefone}
        keyboardType="phone-pad"
      />

      <Button
        title={idEditar !== null ? 'Atualizar' : 'Cadastrar'}
        onPress={salvar}
      />

      <FlatList
        data={lista}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={{ marginTop: 15 }}>
            <Text>{item.nome} - {item.telefone}</Text>

            <Button
              title="Editar"
              onPress={() => editar(item)}
            />

            <Button
              title="Excluir"
              onPress={() => excluir(item.id)}
            />
          </View>
        )}
      />
    </View>
  );
}