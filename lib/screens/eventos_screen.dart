import 'package:flutter/material.dart';
import '../models/evento_model.dart';
import '../services/database.dart';
import 'presenca_screen.dart';

class EventosScreen extends StatelessWidget {
  const EventosScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final Color rosaOficial = Theme.of(context).primaryColor;

    return Column(
      children: [
        // Cabeçalho da Lista de Chamada
        Container(
          width: double.infinity,
          padding: const EdgeInsets.fromLTRB(25, 50, 25, 25),
          decoration: BoxDecoration(
            color: rosaOficial,
            borderRadius: const BorderRadius.vertical(bottom: Radius.circular(35)),
          ),
          child: const Column(
            children: [
              Text(
                "Lista de Chamada",
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)
              ),
              SizedBox(height: 8),
              Text(
                "Selecione o evento para marcar presença",
                style: TextStyle(fontSize: 16, color: Colors.white70),
              ),
            ],
          ),
        ),
        
        const SizedBox(height: 10),

        // Lista de Eventos (O código antigo que você gostava)
        Expanded(
          child: StreamBuilder<List<Evento>>(
            stream: DatabaseService().eventos,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }

              if (!snapshot.hasData || snapshot.data!.isEmpty) {
                return const Center(child: Text('Nenhum evento cadastrado para chamada.'));
              }

              final listaEventos = snapshot.data!;

              return ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                itemCount: listaEventos.length,
                itemBuilder: (context, index) {
                  final evento = listaEventos[index];
                  return Card(
                    elevation: 2,
                    margin: const EdgeInsets.only(bottom: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    child: ListTile(
                      contentPadding: const EdgeInsets.all(16),
                      leading: CircleAvatar(
                        backgroundColor: rosaOficial.withOpacity(0.1),
                        child: Icon(Icons.how_to_reg, color: rosaOficial), // Ícone de presença
                      ),
                      title: Text(evento.nome, style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Padding(
                        padding: const EdgeInsets.only(top: 8.0),
                        child: Text(evento.descricao),
                      ),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () {
                        // Navega para a tela de marcar presença!
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => PresencaScreen(evento: evento),
                          ),
                        );
                      },
                    ),
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }
}