import 'package:flutter/material.dart';
import '../models/ata_model.dart';
import '../models/usuario_model.dart';
import '../services/database.dart';
import 'ler_ata_screen.dart';

class AtasScreen extends StatelessWidget {
  final UsuarioModel usuario;
  const AtasScreen({super.key, required this.usuario});

  @override
  Widget build(BuildContext context) {
    final Color rosaVibrante = Theme.of(context).primaryColor;

    return StreamBuilder<List<AtaModel>>(
      stream: DatabaseService().atas,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return const Center(child: Text("Nenhuma ata registrada ainda."));
        }

        final listaAtas = snapshot.data!;

        return Column(
          children: [
            // Cabeçalho Limpo (Sem o SUM)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(25, 50, 25, 30),
              decoration: BoxDecoration(
                color: rosaVibrante,
                borderRadius: const BorderRadius.vertical(
                  bottom: Radius.circular(35),
                ),
              ),
              child: Column(
                children: [
                  const Text(
                    "Atas das Reuniões",
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "${listaAtas.length} reuniões registradas",
                    style: const TextStyle(fontSize: 16, color: Colors.white70),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 10),

            // Lista mostrando QUANTAS PESSOAS FORAM EM CADA REUNIÃO
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 10,
                ),
                itemCount: listaAtas.length,
                itemBuilder: (context, index) {
                  final ata = listaAtas[index];

                  return Card(
                    elevation: 2,
                    margin: const EdgeInsets.only(bottom: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: ListTile(
                      contentPadding: const EdgeInsets.all(16),
                      leading: CircleAvatar(
                        backgroundColor: rosaVibrante.withOpacity(0.1),
                        child: Icon(
                          Icons.assignment_turned_in,
                          color: rosaVibrante,
                        ),
                      ),
                      title: Text(
                        ata.titulo,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      subtitle: Padding(
                        padding: const EdgeInsets.only(top: 8.0),
                        child: Text(
                          // AQUI ESTÁ O DESTAQUE DA PRESENÇA INDIVIDUAL
                          "${ata.data}  •  ${ata.quantidadePresentes} pessoas presentes",
                          style: TextStyle(
                            color: Colors.grey[700],
                            fontSize: 14,
                          ),
                        ),
                      ),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) =>
                                LerAtaScreen(ata: ata, usuario: usuario),
                          ), 
                        );
                      },
                    ),
                  );
                },
              ),
            ),
          ],
        );
      },
    );
  }
}
