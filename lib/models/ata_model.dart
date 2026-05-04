import 'package:cloud_firestore/cloud_firestore.dart';

class AtaModel {
  final String id;
  final String titulo;
  final String data;
  final String local;
  final String conteudo;
  final int quantidadePresentes;
  final List<String> nomesPresentes;

  AtaModel({
    required this.id,
    required this.titulo,
    required this.data,
    required this.local,
    required this.conteudo,
    required this.quantidadePresentes,
    required this.nomesPresentes,
  });

  factory AtaModel.fromFirestore(DocumentSnapshot doc) {
    final dataMap = doc.data() as Map<String, dynamic>?;

    return AtaModel(
      id: doc.id,
      titulo: dataMap?['titulo'] ?? 'Sem título',
      data: dataMap?['data'] ?? '',
      local: dataMap?['local'] ?? 'Não informado',
      conteudo: dataMap?['conteudo'] ?? '',
      quantidadePresentes: dataMap?['quantidadePresentes'] ?? 0,
      nomesPresentes: List<String>.from(dataMap?['nomesPresentes'] ?? []),
    );
  }
}