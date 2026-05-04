import 'package:flutter/material.dart';
import '../models/ata_model.dart';
import '../services/database.dart';
import 'ler_ata_screen.dart';

class AtasScreen extends StatelessWidget {
  const AtasScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final Color rosaVibrante = Theme.of(context).primaryColor;

    return StreamBuilder<List<AtaModel>>(
      stream: DatabaseService().atas,
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
        
        final listaAtas = snapshot.data!;
        int totalAtas = listaAtas.length;
        int totalPresencasGeral = listaAtas.fold(0, (sum, item) => sum + item.quantidadePresentes);

        return Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(25, 60, 25, 30),
              decoration: BoxDecoration(
                color: rosaVibrante,
                borderRadius: const BorderRadius.vertical(bottom: Radius.circular(35)),
              ),
              child: const Text("Atas das Reuniões", 
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  _card("Atas", "$totalAtas", Colors.blue),
                  const SizedBox(width: 12),
                  _card("Total Presenças", "$totalPresencasGeral", Colors.green),
                ],
              ),
            ),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: listaAtas.length,
                itemBuilder: (context, index) => _item(context, rosaVibrante, listaAtas[index]),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _card(String t, String v, Color c) => Expanded(
    child: Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(color: c.withOpacity(0.1), borderRadius: BorderRadius.circular(20)),
      child: Column(children: [
        Text(v, style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: c)),
        Text(t, style: const TextStyle(fontSize: 12)),
      ]),
    ),
  );

  Widget _item(BuildContext context, Color c, AtaModel a) => Card(
    child: ListTile(
      title: Text(a.titulo, style: const TextStyle(fontWeight: FontWeight.bold)),
      subtitle: Text("${a.data} • ${a.quantidadePresentes} presentes"),
      trailing: const Icon(Icons.chevron_right),
      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => LerAtaScreen(ata: a))),
    ),
  );
}