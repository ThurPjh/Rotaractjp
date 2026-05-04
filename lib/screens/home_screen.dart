import 'package:flutter/material.dart';
import '../models/usuario_model.dart';
import '../models/evento_model.dart';
import '../services/database.dart';
import 'form_evento_screen.dart';

class HomeScreen extends StatelessWidget {
  final UsuarioModel usuario;

  const HomeScreen({super.key, required this.usuario});

  @override
  Widget build(BuildContext context) {
    // Cor oficial que você definiu no main.dart
    const Color rosaOficial = Color.fromRGBO(212, 19, 103, 1);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Rotaract JP',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        backgroundColor: rosaOficial,
        centerTitle: true,
        actions: [
          // Ícone que muda baseado no cargo
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: Center(
              child: Text(
                usuario.cargo.toUpperCase(),
                style: const TextStyle(color: Colors.white, fontSize: 12),
              ),
            ),
          ),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Cabeçalho de Boas-vindas
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Olá, ${usuario.nome}!',
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                const Text(
                  'Confira os próximos eventos do clube:',
                  style: TextStyle(color: Colors.grey),
                ),
              ],
            ),
          ),

          // Lista de Eventos em Tempo Real
          Expanded(
            child: StreamBuilder<List<Evento>>(
              stream: DatabaseService().eventos,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (snapshot.hasError) {
                  return const Center(child: Text('Erro ao carregar dados.'));
                }

                if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return const Center(
                    child: Text('Nenhum evento cadastrado.'),
                  );
                }

                final listaEventos = snapshot.data!;

                return ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: listaEventos.length,
                  itemBuilder: (context, index) {
                    final evento = listaEventos[index];
                    return Card(
                      elevation: 2,
                      margin: const EdgeInsets.only(bottom: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(16),
                        leading: CircleAvatar(
                          backgroundColor: rosaOficial.withOpacity(0.1),
                          child: const Icon(Icons.event, color: rosaOficial),
                        ),
                        title: Text(
                          evento.nome,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        subtitle: Padding(
                          padding: const EdgeInsets.only(top: 8.0),
                          child: Text(evento.descricao),
                        ),
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () {
                          // Futura tela de detalhes ou presença
                        },
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
      
      // Botão Flutuante (Você pode esconder isso se o usuario.cargo != 'adm')
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => FormEventoScreen()),
          );
        },
        backgroundColor: rosaOficial,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }
}