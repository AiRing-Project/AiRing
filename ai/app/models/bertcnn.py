from transformers import PreTrainedModel, PretrainedConfig, AutoModel, AutoConfig
import torch.nn as nn

class BertCNNConfig(PretrainedConfig):
    model_type = "bertcnn"
    def __init__(
        self,
        num_labels=14,
        hidden_size=768,
        conv_output_channels=256,
        kernel_size=3,
        pretrained_model_name="hun3359/klue-bert-base-sentiment",
        **kwargs
    ):
        super().__init__(**kwargs)
        self.num_labels = num_labels
        self.hidden_size = hidden_size
        self.conv_output_channels = conv_output_channels
        self.kernel_size = kernel_size
        self.pretrained_model_name = pretrained_model_name

class BertCNNForMultiLabel(PreTrainedModel):
    config_class = BertCNNConfig
    def __init__(self, config):
        super().__init__(config)
        self.bert = AutoModel.from_pretrained(
            config.pretrained_model_name,
            config=AutoConfig.from_pretrained(config.pretrained_model_name)
        )
        self.conv = nn.Conv1d(
            config.hidden_size,
            config.conv_output_channels,
            kernel_size=config.kernel_size,
            padding=1
        )
        self.relu = nn.ReLU()
        self.pool = nn.AdaptiveMaxPool1d(1)
        self.classifier = nn.Linear(config.conv_output_channels, config.num_labels)

    def forward(self, input_ids, attention_mask=None, token_type_ids=None, labels=None):
        outputs = self.bert(
            input_ids=input_ids,
            attention_mask=attention_mask,
            token_type_ids=token_type_ids
        )
        x = outputs.last_hidden_state.transpose(1, 2)
        x = self.conv(x)
        x = self.relu(x)
        x = self.pool(x).squeeze(-1)
        logits = self.classifier(x)
        return {"logits": logits}