import 'package:flutter/material.dart';
import '../models/ata_model.dart';
import '../services/database.dart';
import 'ler_ata_screen.dart'; 

class AtasScreen extends StatelessWidget {
  const AtasScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Busca a cor primária definida no seu Theme (o Rosa Oficial)
    final Color rosaVibrante = Theme.of(context).primaryColor;

    return Column(
      children: [
        // Cabeçalho estilizado
        Container(
          width: double.infinity,
          padding: const EdgeInsets.fromLTRB(25, 60, 25, 30),
          decoration: BoxDecoration(
            color: rosaVibrante,
            borderRadius: const BorderRadius.vertical(
              bottom: Radius.circular(35),
            ),
          ),
          child: const Text(
            "Atas das Reuniões",
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),

        // Área da lista com StreamBuilder para atualização em tempo real
        Expanded(
          child: StreamBuilder<List<AtaModel>>(
            // Certifique-se que o método 'atas' existe no seu DatabaseService
            stream: DatabaseService().atas, 
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }

              if (snapshot.hasError) {
                return const Center(
                  child: Text("Erro ao carregar as atas."),
                );
              }

              if (!snapshot.hasData || snapshot.data!.isEmpty) {
                return const Center(
                  child: Text("Nenhuma ata cadastrada até o momento."),
                );
              }

              final listaAtas = snapshot.data!;

              return ListView.builder(
                padding: const EdgeInsets.all(20),
                itemCount: listaAtas.length,
                itemBuilder: (context, index) {
                  final ata = listaAtas[index];
                  return _itemAta(context, rosaVibrante, ata);
                },
              );
            },
          ),
        ),
      ],
    );
  }

  // Widget auxiliar para cada item da lista (Card)
  Widget _itemAta(BuildContext context, Color cor, AtaModel ata) {
    return Card(
      elevation: 1,
      margin: const EdgeInsets.only(bottom: 15),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: cor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(Icons.description, color: cor),
        ),
        title: Text(
          ata.titulo,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        subtitle: Text(
          ata.data, // Como você optou por String, ele exibe o que estiver no banco
          style: TextStyle(color: Colors.grey[600]),
        ),
        trailing: const Icon(Icons.chevron_right, color: Colors.grey),
        onTap: () {
          // Navega para a tela de leitura passando o objeto 'ata'
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => LerAtaScreen(ata: ata),
            ),
          );
        },
      ),
    );
  }
}