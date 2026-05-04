import 'package:flutter/material.dart';
import '../models/ata_model.dart';

class LerAtaScreen extends StatelessWidget {
  final AtaModel ata;
  const LerAtaScreen({super.key, required this.ata});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Detalhes da Ata")),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(ata.titulo, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            Text(ata.data, style: const TextStyle(color: Colors.grey)),
            const Divider(height: 30),
            const Text("Conteúdo:", style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            Text(ata.conteudo, style: const TextStyle(fontSize: 16)),
            const SizedBox(height: 30),
            const Text("Lista de Presença Individual:", style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            ata.nomesPresentes.isEmpty 
              ? const Text("Nenhum presente registrado.")
              : Wrap(
                  spacing: 8,
                  children: ata.nomesPresentes.map((nome) => Chip(
                    label: Text(nome, style: const TextStyle(fontSize: 12)),
                    backgroundColor: Colors.blue.withOpacity(0.1),
                  )).toList(),
                ),
          ],
        ),
      ),
    );
  }
}