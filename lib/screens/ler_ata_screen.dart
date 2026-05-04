import 'package:flutter/material.dart';
import '../models/ata_model.dart';
import '../models/usuario_model.dart'; // Importação do Usuario
import '../services/database.dart'; // Importação do Banco de Dados

class LerAtaScreen extends StatelessWidget {
  final AtaModel ata;
  final UsuarioModel usuario; // Precisamos receber o usuário para o IF de ADM

  const LerAtaScreen({super.key, required this.ata, required this.usuario});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Detalhes da Ata"),
        actions: [
          // IF DE ADM: Só mostra o ícone do lápis se o cargo for adm
          if (usuario.cargo.toLowerCase() == 'presidente' || usuario.cargo.toLowerCase() == 'secretario')
            IconButton(
              icon: const Icon(Icons.edit),
              onPressed: () {
                // Controlador preenchido com o texto atual
                TextEditingController editController = TextEditingController(text: ata.conteudo);

                showDialog(
                  context: context,
                  builder: (context) {
                    return AlertDialog(
                      title: const Text('Editar Ata'),
                      content: SizedBox(
                        width: double.maxFinite,
                        child: TextField(
                          controller: editController,
                          maxLines: 10, // Espaço grande para escrever bastante
                          decoration: const InputDecoration(
                            hintText: 'Escreva o que foi discutido na reunião...',
                            border: OutlineInputBorder(),
                          ),
                        ),
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(context), // Cancela
                          child: const Text('Cancelar'),
                        ),
                        ElevatedButton(
                          onPressed: () async {
                            // Salva a nova descrição no Firebase
                            await DatabaseService().atualizarConteudoAta(ata.id, editController.text);
                            
                            // Fecha o pop-up e mostra aviso de sucesso
                            if (context.mounted) {
                              Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Ata atualizada com sucesso! Volte para atualizar a tela.')),
                              );
                            }
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Theme.of(context).primaryColor,
                            foregroundColor: Colors.white,
                          ),
                          child: const Text('Salvar'),
                        ),
                      ],
                    );
                  },
                );
              },
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(ata.titulo, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            Text(ata.data, style: const TextStyle(color: Colors.grey)),
            const Divider(height: 30),
            
            // LOCALIZAÇÃO
            const Row(
              children: [
                Icon(Icons.location_on, size: 18, color: Colors.grey),
                SizedBox(width: 5),
                Text("Local:", style: TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 5),
            Text(ata.local),
            
            const SizedBox(height: 20),
            const Text("Conteúdo da Reunião:", style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            
            // CONTEÚDO
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(15),
              decoration: BoxDecoration(
                color: Colors.grey.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(ata.conteudo, style: const TextStyle(fontSize: 16, height: 1.5)),
            ),
            
            const SizedBox(height: 30),
            const Text("Lista de Presença Individual:", style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            
            // LISTA DE PRESENÇA
            ata.nomesPresentes.isEmpty 
              ? const Text("Nenhum presente registrado.")
              : Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: ata.nomesPresentes.map((nome) => Chip(
                    label: Text(nome, style: const TextStyle(fontSize: 12)),
                    backgroundColor: Theme.of(context).primaryColor.withOpacity(0.1),
                    side: BorderSide.none,
                  )).toList(),
                ),
          ],
        ),
      ),
    );
  }
}