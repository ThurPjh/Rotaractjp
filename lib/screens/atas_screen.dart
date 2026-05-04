import 'package:flutter/material.dart';

class AtasScreen extends StatelessWidget {
  const AtasScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final Color rosaVibrante = Theme.of(context).primaryColor;

    return Column(
      children: [
        // Cabeçalho da Tela de Atas
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

        // Lista de Atas
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              _itemAta(
                rosaVibrante,
                "Reunião Ordinária #12",
                "03 de Junho, 2026",
                "Ata_03_06.pdf",
              ),
              _itemAta(
                rosaVibrante,
                "Assembléia Geral",
                "27 de Maio, 2026",
                "Ata_27_05.pdf",
              ),
              _itemAta(
                rosaVibrante,
                "Reunião de Projetos",
                "20 de Maio, 2026",
                "Proj_Maio.pdf",
              ),
              _itemAta(
                rosaVibrante,
                "Reunião Ordinária #11",
                "13 de Maio, 2026",
                "Ata_13_05.pdf",
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _itemAta(Color cor, String titulo, String data, String arquivo) {
    return Card(
      margin: const EdgeInsets.only(bottom: 15),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: cor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(Icons.picture_as_pdf, color: cor),
        ),
        title: Text(
          titulo,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        subtitle: Text(data),
        onTap: () {
          // Aqui no futuro você colocará a lógica para abrir o PDF
        },
      ),
    );
  }
}
