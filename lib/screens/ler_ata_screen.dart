import 'package:flutter/material.dart';
import '../models/ata_model.dart';

class LerAtaScreen extends StatelessWidget {
  final AtaModel ata;
  const LerAtaScreen({super.key, required this.ata});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Leitura de Ata"),
        backgroundColor: Theme.of(context).primaryColor,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(25),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              ata.titulo,
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              "Data da Reunião: ${ata.data}",
              style: TextStyle(color: Colors.grey[600], fontSize: 14),
            ),
            const Divider(height: 40),
            Text(
              ata.conteudo,
              style: const TextStyle(
                fontSize: 16,
                height: 1.6,
                color: Colors.black87,
              ),
            ),
          ],
        ),
      ),
    );
  }
}