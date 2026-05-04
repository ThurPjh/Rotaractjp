import 'package:cloud_firestore/cloud_firestore.dart';

class Evento {
  final String id;
  final String nome;
  final String descricao;
  final DateTime data;
  final List<String> presencas;

  Evento({required this.id, required this.nome, required this.descricao, required this.data, required this.presencas});

  // Converte o que vem do Firebase (JSON) para o nosso objeto Evento
  factory Evento.fromFirestore(DocumentSnapshot doc) {
    Map data = doc.data() as Map;
    return Evento(
      id: doc.id,
      nome: data['nome'] ?? '',
      descricao: data['descricao'] ?? '',
      data: (data['data'] as Timestamp).toDate(),
      presencas: List<String>.from(data['presencas'] ?? []),
    );
  }
}