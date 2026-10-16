import { View, Text, Button } from 'react-native';
import { router } from 'expo-router';

export default function TelaInicial() {
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>

      {/* CABEÇALHO */}
      <View style={{
        backgroundColor: '#2354D6',
        padding: 20,
        alignItems: 'center'
      }}>
        <Text style={{
          color: 'white',
          fontSize: 24,
          fontWeight: 'bold'
        }}>
          Minha Avaliação
        </Text>
      </View>

      {/* BOTÕES */}
      <View style={{
        flex: 1,
        padding: 30,
        justifyContent: 'center',
        gap: 15
      }}>

        <Button
          title="Agenda de Contatos"
          onPress={() => router.push('/contatos')}
        />

        <Button
          title="Biblioteca Pessoal"
          onPress={() => router.push('/biblioteca')}
        />

        <Button
          title="Lista de Compras"
          onPress={() => router.push('/compras')}
        />

        <Button
          title="Avaliação de Filmes"
          onPress={() => router.push('/filmes')}
        />

      </View>
    </View>
  );
}