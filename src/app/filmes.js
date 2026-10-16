import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Alert
} from 'react-native';
import * as SQLite from 'expo-sqlite';

export default function Filmes() {
  const [db, setDb] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [nota, setNota] = useState('');
  const [filmes, setFilmes] = useState([]);
  const [idEditar, setIdEditar] = useState(null);

  useEffect(() => {
    iniciarBanco();
  }, []);

  const iniciarBanco = async () => {
    try {
      const banco = await SQLite.openDatabaseAsync('filmes.db');

      await banco.execAsync(`
        CREATE TABLE IF NOT EXISTS filmes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          titulo TEXT,
          nota REAL
        );
      `);

      setDb(banco);
      carregar(banco);
    } catch (erro) {
      Alert.alert('Erro', 'Erro ao abrir o banco de dados.');
    }
  };

  const carregar = async (banco = db) => {
    if (!banco) return;

    const resultado = await banco.getAllAsync(
      'SELECT * FROM filmes'
    );

    setFilmes(resultado);
  };

  const salvar = async () => {
    if (!db) return;

    const numero = Number(nota.replace(',', '.'));

    if (
      titulo.trim() === '' ||
      nota.trim() === '' ||
      !Number.isFinite(numero) ||
      numero < 0 ||
      numero > 10
    ) {
      Alert.alert('Atenção', 'Informe título e nota de 0 a 10.');
      return;
    }

    if (idEditar === null) {
      await db.runAsync(
        'INSERT INTO filmes (titulo, nota) VALUES (?, ?)',
        [titulo, numero]
      );
    } else {
      await db.runAsync(
        'UPDATE filmes SET titulo = ?, nota = ? WHERE id = ?',
        [titulo, numero, idEditar]
      );
    }

    setTitulo('');
    setNota('');
    setIdEditar(null);
    carregar();
  };

  const editar = (filme) => {
    setTitulo(filme.titulo);
    setNota(String(filme.nota));
    setIdEditar(filme.id);
  };

  const excluir = async (id) => {
    if (!db) return;

    await db.runAsync(
      'DELETE FROM filmes WHERE id = ?',
      [id]
    );

    if (idEditar === id) {
      setTitulo('');
      setNota('');
      setIdEditar(null);
    }

    carregar();
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>

      <Text style={{ fontSize: 24, marginBottom: 20 }}>
        Avaliação de Filmes
      </Text>

      <TextInput
        placeholder="Título do filme"
        value={titulo}
        onChangeText={setTitulo}
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 10
        }}
      />

      <TextInput
        placeholder="Nota de 0 a 10"
        value={nota}
        onChangeText={setNota}
        keyboardType="decimal-pad"
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 10
        }}
      />

      <Button
        title={idEditar === null ? 'Salvar' : 'Atualizar'}
        onPress={salvar}
      />

      <FlatList
        data={filmes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{
            padding: 10,
            marginTop: 10,
            borderWidth: 1
          }}>

            <Text>
              Filme: {item.titulo}
            </Text>

            <Text style={{
              color: item.nota >= 7 ? 'green' : 'red',
              fontSize: 18
            }}>
              Nota: {item.nota.toFixed(1)}
            </Text>

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